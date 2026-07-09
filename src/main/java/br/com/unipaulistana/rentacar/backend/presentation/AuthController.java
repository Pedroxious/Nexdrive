package br.com.unipaulistana.rentacar.backend.presentation;

import br.com.unipaulistana.rentacar.backend.domain.User;
import br.com.unipaulistana.rentacar.backend.service.AuthService;
import br.com.unipaulistana.rentacar.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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
    private final br.com.unipaulistana.rentacar.backend.service.LoginRateLimiterService rateLimiterService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody User user) {
        String token = authService.register(user);
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> request,
            jakarta.servlet.http.HttpServletRequest httpRequest,
            jakarta.servlet.http.HttpServletResponse response) {
        
        String email = request.get("email");
        String ip = httpRequest.getRemoteAddr();

        if (rateLimiterService.isBlocked(ip) || (email != null && rateLimiterService.isBlocked(email))) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Muitas tentativas de login. Tente novamente em 15 minutos."));
        }

        try {
            Map<String, Object> authData = authService.login(email, request.get("password"));
            rateLimiterService.loginSucceeded(ip);
            if (email != null) {
                rateLimiterService.loginSucceeded(email);
            }

            String token = (String) authData.get("token");
            org.springframework.http.ResponseCookie responseCookie = org.springframework.http.ResponseCookie.from("token", token)
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(86400)
                    .sameSite("Lax")
                    .build();
            response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, responseCookie.toString());

            return ResponseEntity.ok(authData);
        } catch (Exception e) {
            rateLimiterService.loginFailed(ip);
            if (email != null) {
                rateLimiterService.loginFailed(email);
            }
            throw e;
        }
    }

    @GetMapping("/me")
    public ResponseEntity<User> getMe() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(userRepository.findByEmail(email).orElseThrow());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(jakarta.servlet.http.HttpServletRequest request, jakarta.servlet.http.HttpServletResponse response) {
        String authHeader = request.getHeader("Authorization");
        String jwt = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
        } else {
            jakarta.servlet.http.Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (jakarta.servlet.http.Cookie cookie : cookies) {
                    if ("token".equals(cookie.getName())) {
                        jwt = cookie.getValue();
                        break;
                    }
                }
            }
        }

        authService.logout(jwt);
        SecurityContextHolder.clearContext();

        org.springframework.http.ResponseCookie responseCookie = org.springframework.http.ResponseCookie.from("token", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, responseCookie.toString());
        return ResponseEntity.ok().build();
    }
}
