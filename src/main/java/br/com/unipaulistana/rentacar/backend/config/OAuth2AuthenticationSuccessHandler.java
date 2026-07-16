package br.com.unipaulistana.rentacar.backend.config;

import br.com.unipaulistana.rentacar.backend.domain.User;
import br.com.unipaulistana.rentacar.backend.domain.UserRole;
import br.com.unipaulistana.rentacar.backend.domain.UserSession;
import br.com.unipaulistana.rentacar.backend.repository.UserRepository;
import br.com.unipaulistana.rentacar.backend.repository.UserSessionRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        log.info("OAuth2: Google login success handler triggered for email: {}", email);

        if (email == null) {
            log.warn("OAuth2: Redirecting to login with error because email attribute is missing.");
            response.sendRedirect("/login?error=no_email");
            return;
        }

        final boolean[] isNewUser = {false};
        User user = userRepository.findByEmail(email)
                .map(existingUser -> {
                    log.info("OAuth2: Found existing user in DB with email: {}", email);
                    existingUser.setLastLoginAt(LocalDateTime.now());
                    if (existingUser.getProfileImageUrl() == null) {
                        existingUser.setProfileImageUrl(picture);
                    }
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    log.info("OAuth2: Creating a new user record in DB for email: {}", email);
                    isNewUser[0] = true;
                    User newUser = User.builder()
                            .email(email)
                            .fullName(name != null ? name : "Google User")
                            .profileImageUrl(picture)
                            .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .role(UserRole.USER)
                            .lastLoginAt(LocalDateTime.now())
                            .build();
                    return userRepository.save(newUser);
                });

        log.info("OAuth2: User resolved in database. ID: {}, email: {}, isNew: {}", user.getId(), user.getEmail(), isNewUser[0]);

        String token = jwtService.generateToken(user);
        log.info("OAuth2: JWT token generated. Starts with: {}", token.substring(0, Math.min(10, token.length())));

        String refreshToken = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(7);

        createSession(user, token, refreshToken, expiresAt, request.getHeader("User-Agent"));
        log.info("OAuth2: Session registered successfully for user ID: {}", user.getId());

        org.springframework.http.ResponseCookie responseCookie = org.springframework.http.ResponseCookie.from("token", token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(86400)
                .sameSite("Lax")
                .build();
        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, responseCookie.toString());

        org.springframework.http.ResponseCookie refreshCookie = org.springframework.http.ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(604800)
                .sameSite("Lax")
                .build();
        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, refreshCookie.toString());

        log.info("OAuth2: Successfully wrote HTTP-Only cookies. Redirecting to /login?oauth2=success");
        response.sendRedirect("/login?oauth2=success");
    }

    private void createSession(User user, String token, String refreshToken, LocalDateTime refreshTokenExpiresAt, String userAgent) {
        String device = getDeviceFromUserAgent(userAgent);
        UserSession session = UserSession.builder()
                .user(user)
                .token(token)
                .device(device)
                .refreshToken(refreshToken)
                .refreshTokenExpiresAt(refreshTokenExpiresAt)
                .createdAt(LocalDateTime.now())
                .active(true)
                .build();
        sessionRepository.save(session);
    }

    private String getDeviceFromUserAgent(String userAgent) {
        if (userAgent == null || userAgent.isEmpty()) {
            return "Dispositivo desconhecido";
        }
        String ua = userAgent.toLowerCase();
        String browser = "Navegador Desconhecido";
        if (ua.contains("chrome") && !ua.contains("edg") && !ua.contains("opr")) {
            browser = "Chrome";
        } else if (ua.contains("firefox")) {
            browser = "Firefox";
        } else if (ua.contains("safari") && !ua.contains("chrome")) {
            browser = "Safari";
        } else if (ua.contains("edg")) {
            browser = "Edge";
        } else if (ua.contains("opr") || ua.contains("opera")) {
            browser = "Opera";
        }

        String os = "Sistema Desconhecido";
        if (ua.contains("windows")) {
            os = "Windows";
        } else if (ua.contains("mac")) {
            os = "macOS";
        } else if (ua.contains("linux")) {
            os = "Linux";
        } else if (ua.contains("android")) {
            os = "Android";
        } else if (ua.contains("iphone") || ua.contains("ipad")) {
            os = "iOS";
        }
        return browser + " no " + os;
    }
}
