package br.com.unipaulistana.rentacar.backend.service;

import br.com.unipaulistana.rentacar.backend.config.JwtService;
import br.com.unipaulistana.rentacar.backend.domain.User;
import br.com.unipaulistana.rentacar.backend.domain.UserRole;
import br.com.unipaulistana.rentacar.backend.domain.UserSession;
import br.com.unipaulistana.rentacar.backend.repository.UserRepository;
import br.com.unipaulistana.rentacar.backend.repository.UserSessionRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AuthService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserSessionRepository sessionRepository;
    private final HttpServletRequest request;

    public Map<String, Object> register(User userRequest) {
        User user = User.builder()
                .fullName(userRequest.getFullName())
                .email(userRequest.getEmail())
                .password(passwordEncoder.encode(userRequest.getPassword()))
                .phone(userRequest.getPhone())
                .cpf(userRequest.getCpf())
                .birthDate(userRequest.getBirthDate())
                .role(UserRole.USER)
                .build();
        repository.save(user);
        
        String token = jwtService.generateToken(user);
        String refreshToken = java.util.UUID.randomUUID().toString();
        java.time.LocalDateTime expiresAt = java.time.LocalDateTime.now().plusDays(7);
        createSession(user, token, refreshToken, expiresAt);
        return Map.of("token", token, "refreshToken", refreshToken, "user", user);
    }

    public Map<String, Object> login(String email, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        User user = repository.findByEmail(email).orElseThrow();
        
        String token = jwtService.generateToken(user);
        String refreshToken = java.util.UUID.randomUUID().toString();
        java.time.LocalDateTime expiresAt = java.time.LocalDateTime.now().plusDays(7);
        createSession(user, token, refreshToken, expiresAt);
        return Map.of("token", token, "refreshToken", refreshToken, "user", user);
    }

    public Map<String, Object> refreshToken(String refreshToken) {
        UserSession session = sessionRepository.findByRefreshTokenAndActiveTrue(refreshToken)
                .orElseThrow(() -> new org.springframework.security.authentication.BadCredentialsException("Refresh token inválido ou inativo"));
        
        if (session.getRefreshTokenExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            session.setActive(false);
            sessionRepository.save(session);
            throw new org.springframework.security.authentication.BadCredentialsException("Refresh token expirado");
        }

        User user = session.getUser();
        String newToken = jwtService.generateToken(user);
        String newRefreshToken = java.util.UUID.randomUUID().toString();
        java.time.LocalDateTime expiresAt = java.time.LocalDateTime.now().plusDays(7);

        session.setToken(newToken);
        session.setRefreshToken(newRefreshToken);
        session.setRefreshTokenExpiresAt(expiresAt);
        sessionRepository.save(session);

        return Map.of("token", newToken, "refreshToken", newRefreshToken, "user", user);
    }

    public void logout(String jwt) {
        if (jwt != null) {
            sessionRepository.findByTokenAndActiveTrue(jwt).ifPresent(session -> {
                session.setActive(false);
                sessionRepository.save(session);
            });
        }
    }

    private void createSession(User user, String token, String refreshToken, java.time.LocalDateTime refreshTokenExpiresAt) {
        String userAgent = request.getHeader("User-Agent");
        String device = getDeviceFromUserAgent(userAgent);
        
        UserSession session = UserSession.builder()
                .user(user)
                .token(token)
                .device(device)
                .refreshToken(refreshToken)
                .refreshTokenExpiresAt(refreshTokenExpiresAt)
                .createdAt(java.time.LocalDateTime.now())
                .active(true)
                .build();
        sessionRepository.save(session);
        
        user.setLastLoginAt(java.time.LocalDateTime.now());
        repository.save(user);
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
