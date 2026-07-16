package br.com.unipaulistana.rentacar.backend.service;

import br.com.unipaulistana.rentacar.backend.config.JwtService;
import br.com.unipaulistana.rentacar.backend.domain.User;
import br.com.unipaulistana.rentacar.backend.domain.UserRole;
import br.com.unipaulistana.rentacar.backend.domain.UserSession;
import br.com.unipaulistana.rentacar.backend.dto.RegisterRequestDto;
import br.com.unipaulistana.rentacar.backend.dto.UserResponseDto;
import br.com.unipaulistana.rentacar.backend.repository.UserRepository;
import br.com.unipaulistana.rentacar.backend.repository.UserSessionRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

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

    public Map<String, Object> register(RegisterRequestDto dto) {
        if (repository.findByEmail(dto.email()).isPresent()) {
            throw new IllegalArgumentException("E-mail já cadastrado.");
        }

        User user = User.builder()
                .fullName(dto.fullName().strip())
                .email(dto.email().toLowerCase().strip())
                .password(passwordEncoder.encode(dto.password()))
                .phone(dto.phone())
                .cpf(dto.cpf())
                .birthDate(dto.birthDate())
                .role(UserRole.USER)
                .build();
        repository.save(user);

        String token = jwtService.generateToken(user);
        String refreshToken = UUID.randomUUID().toString();
        LocalDateTime refreshExpiresAt = LocalDateTime.now().plusDays(7);
        createSession(user, token, refreshToken, refreshExpiresAt);

        // V-01 fix: return UserResponseDto, never the User entity
        return Map.of(
                "token", token,
                "refreshToken", refreshToken,
                "user", UserResponseDto.from(user)
        );
    }

    public Map<String, Object> login(String email, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        User user = repository.findByEmail(email).orElseThrow();

        String token = jwtService.generateToken(user);
        String refreshToken = UUID.randomUUID().toString();
        LocalDateTime refreshExpiresAt = LocalDateTime.now().plusDays(7);
        createSession(user, token, refreshToken, refreshExpiresAt);

        // V-01 fix: return UserResponseDto, never the User entity
        return Map.of(
                "token", token,
                "refreshToken", refreshToken,
                "user", UserResponseDto.from(user)
        );
    }

    public Map<String, Object> refreshToken(String refreshToken) {
        UserSession session = sessionRepository.findByRefreshTokenAndActiveTrue(refreshToken)
                .orElseThrow(() -> new org.springframework.security.authentication.BadCredentialsException(
                        "Token de sessão inválido ou expirado."));

        if (session.getRefreshTokenExpiresAt().isBefore(LocalDateTime.now())) {
            session.setActive(false);
            sessionRepository.save(session);
            throw new org.springframework.security.authentication.BadCredentialsException(
                    "Token de sessão inválido ou expirado.");
        }

        User user = session.getUser();
        String newToken = jwtService.generateToken(user);
        String newRefreshToken = UUID.randomUUID().toString();
        LocalDateTime newExpiresAt = LocalDateTime.now().plusDays(7);

        // V-04 fix: rotate refresh token — invalidate old one by updating in place
        session.setToken(newToken);
        session.setRefreshToken(newRefreshToken);
        session.setRefreshTokenExpiresAt(newExpiresAt);
        sessionRepository.save(session);

        // V-01 fix: return UserResponseDto, never the User entity
        return Map.of(
                "token", newToken,
                "refreshToken", newRefreshToken,
                "user", UserResponseDto.from(user)
        );
    }

    public void logout(String jwt) {
        if (jwt != null && !jwt.isBlank()) {
            sessionRepository.findByTokenAndActiveTrue(jwt).ifPresent(session -> {
                session.setActive(false);
                sessionRepository.save(session);
            });
        }
    }

    private void createSession(User user, String token, String refreshToken, LocalDateTime refreshTokenExpiresAt) {
        String device = getDeviceFromUserAgent(request.getHeader("User-Agent"));
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

        user.setLastLoginAt(LocalDateTime.now());
        repository.save(user);
    }

    public static String getDeviceFromUserAgent(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
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
