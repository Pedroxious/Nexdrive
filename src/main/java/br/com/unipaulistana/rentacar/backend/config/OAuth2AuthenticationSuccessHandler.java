package br.com.unipaulistana.rentacar.backend.config;

import br.com.unipaulistana.rentacar.backend.domain.User;
import br.com.unipaulistana.rentacar.backend.domain.UserRole;
import br.com.unipaulistana.rentacar.backend.domain.UserSession;
import br.com.unipaulistana.rentacar.backend.repository.UserRepository;
import br.com.unipaulistana.rentacar.backend.repository.UserSessionRepository;
import br.com.unipaulistana.rentacar.backend.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final UserSessionRepository sessionRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    // Must match the JWT expiration configured in application.yml / JWT_EXPIRATION env
    @Value("${application.security.jwt.expiration:900000}")
    private long jwtExpirationMs;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name  = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        log.info("OAuth2 login success for email: {}", email);

        if (email == null) {
            log.warn("OAuth2 login failed: email attribute missing from provider response.");
            response.sendRedirect("/login?error=no_email");
            return;
        }

        final boolean[] isNewUser = {false};
        User user = userRepository.findByEmail(email)
                .map(existingUser -> {
                    existingUser.setLastLoginAt(LocalDateTime.now());
                    if (existingUser.getProfileImageUrl() == null) {
                        existingUser.setProfileImageUrl(picture);
                    }
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    isNewUser[0] = true;
                    User newUser = User.builder()
                            .email(email)
                            .fullName(name != null ? name : "Google User")
                            .profileImageUrl(picture)
                            // Random password — OAuth users never use password login
                            .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .role(UserRole.USER)
                            .lastLoginAt(LocalDateTime.now())
                            .build();
                    return userRepository.save(newUser);
                });

        log.info("OAuth2 user resolved: id={}, isNew={}", user.getId(), isNewUser[0]);

        String token        = jwtService.generateToken(user);
        String refreshToken = UUID.randomUUID().toString();
        LocalDateTime refreshExpiresAt = LocalDateTime.now().plusDays(7);

        // Persist session (same as password login)
        UserSession session = UserSession.builder()
                .user(user)
                .token(token)
                .device(AuthService.getDeviceFromUserAgent(request.getHeader("User-Agent")))
                .refreshToken(refreshToken)
                .refreshTokenExpiresAt(refreshExpiresAt)
                .createdAt(LocalDateTime.now())
                .active(true)
                .build();
        sessionRepository.save(session);

        // V-04/V-13 fix: cookie maxAge aligned with actual JWT expiration (15 min)
        int accessTokenMaxAge  = (int) (jwtExpirationMs / 1000); // convert ms → seconds
        int refreshTokenMaxAge = 60 * 60 * 24 * 7; // 7 days in seconds

        response.addHeader(HttpHeaders.SET_COOKIE,
                buildCookie("token", token, accessTokenMaxAge).toString());
        response.addHeader(HttpHeaders.SET_COOKIE,
                buildCookie("refreshToken", refreshToken, refreshTokenMaxAge).toString());

        log.info("OAuth2 cookies set. Redirecting to /login?oauth2=success");
        response.sendRedirect("/login?oauth2=success");
    }

    private ResponseCookie buildCookie(String name, String value, int maxAge) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(maxAge)
                .sameSite("Lax")
                .build();
    }
}
