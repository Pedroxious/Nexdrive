package br.com.unipaulistana.rentacar.backend.presentation;

import br.com.unipaulistana.rentacar.backend.dto.RegisterRequestDto;
import br.com.unipaulistana.rentacar.backend.dto.UserResponseDto;
import br.com.unipaulistana.rentacar.backend.repository.UserRepository;
import br.com.unipaulistana.rentacar.backend.service.AuthService;
import br.com.unipaulistana.rentacar.backend.service.LoginRateLimiterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final LoginRateLimiterService rateLimiterService;

    // Access-token cookie lifetime matches JWT expiration (15 min)
    private static final int ACCESS_TOKEN_MAX_AGE = 900;
    // Refresh-token cookie lifetime: 7 days
    private static final int REFRESH_TOKEN_MAX_AGE = 604800;

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequestDto dto,
            jakarta.servlet.http.HttpServletRequest httpRequest,
            jakarta.servlet.http.HttpServletResponse response) {
        String ip = httpRequest.getRemoteAddr();

        if (rateLimiterService.isBlocked(ip)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Muitas tentativas de cadastro. Tente novamente em 15 minutos."));
        }

        try {
            Map<String, Object> authData = authService.register(dto);
            rateLimiterService.loginSucceeded(ip);
            setAuthCookies(response, (String) authData.get("token"), (String) authData.get("refreshToken"));
            // Return only the user DTO — no token in body (it's in httpOnly cookie)
            return ResponseEntity.ok(Map.of("user", authData.get("user")));
        } catch (IllegalArgumentException e) {
            rateLimiterService.loginFailed(ip);
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            rateLimiterService.loginFailed(ip);
            throw e;
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> request,
            jakarta.servlet.http.HttpServletRequest httpRequest,
            jakarta.servlet.http.HttpServletResponse response) {

        String email = request.get("email");
        String ip = httpRequest.getRemoteAddr();

        // Rate limiting check
        if (rateLimiterService.isBlocked(ip) || (email != null && rateLimiterService.isBlocked(email))) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Muitas tentativas de login. Tente novamente em 15 minutos."));
        }

        try {
            Map<String, Object> authData = authService.login(email, request.get("password"));
            rateLimiterService.loginSucceeded(ip);
            if (email != null) rateLimiterService.loginSucceeded(email);

            setAuthCookies(response, (String) authData.get("token"), (String) authData.get("refreshToken"));
            // Return only the user DTO — no raw token in body
            return ResponseEntity.ok(Map.of("user", authData.get("user")));
        } catch (Exception e) {
            rateLimiterService.loginFailed(ip);
            if (email != null) rateLimiterService.loginFailed(email);
            throw e;
        }
    }

    /**
     * Refresh endpoint — V-04 fix: reads refreshToken ONLY from httpOnly cookie, never from request body.
     * The old body-based flow allowed JavaScript to access the refresh token via localStorage,
     * defeating the httpOnly protection.
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            jakarta.servlet.http.HttpServletRequest httpRequest,
            jakarta.servlet.http.HttpServletResponse response) {

        // Read refresh token ONLY from cookie — never from request body
        String refreshToken = extractCookieValue(httpRequest, "refreshToken");

        if (refreshToken == null) {
            clearAuthCookies(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Sessão expirada. Faça login novamente."));
        }

        try {
            Map<String, Object> authData = authService.refreshToken(refreshToken);
            setAuthCookies(response, (String) authData.get("token"), (String) authData.get("refreshToken"));
            // Return only user DTO — no token in body
            return ResponseEntity.ok(Map.of("user", authData.get("user")));
        } catch (Exception e) {
            clearAuthCookies(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Sessão expirada. Faça login novamente."));
        }
    }

    /**
     * V-01 fix: returns UserResponseDto, never the User entity.
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getMe() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .map(user -> ResponseEntity.ok(UserResponseDto.from(user)))
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            jakarta.servlet.http.HttpServletRequest request,
            jakarta.servlet.http.HttpServletResponse response) {

        String jwt = extractCookieValue(request, "token");
        // Also check Bearer header for Swagger/API tool users
        if (jwt == null) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                jwt = authHeader.substring(7);
            }
        }

        authService.logout(jwt);
        SecurityContextHolder.clearContext();
        clearAuthCookies(response);

        return ResponseEntity.ok().build();
    }

    // ── Cookie helpers ────────────────────────────────────────────────────────

    private void setAuthCookies(jakarta.servlet.http.HttpServletResponse response, String token, String refreshToken) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie("token", token, ACCESS_TOKEN_MAX_AGE, "/").toString());
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie("refreshToken", refreshToken, REFRESH_TOKEN_MAX_AGE, "/api/auth/refresh").toString());
    }

    private void clearAuthCookies(jakarta.servlet.http.HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie("token", "", 0, "/").toString());
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie("refreshToken", "", 0, "/api/auth/refresh").toString());
    }

    private ResponseCookie buildCookie(String name, String value, int maxAge, String path) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(true)
                .path(path)
                .maxAge(maxAge)
                .sameSite("Lax")
                .build();
    }

    private String extractCookieValue(jakarta.servlet.http.HttpServletRequest request, String cookieName) {
        jakarta.servlet.http.Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        for (jakarta.servlet.http.Cookie c : cookies) {
            if (cookieName.equals(c.getName())) return c.getValue();
        }
        return null;
    }
}
