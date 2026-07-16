package br.com.unipaulistana.rentacar.backend.presentation;

import br.com.unipaulistana.rentacar.backend.domain.User;
import br.com.unipaulistana.rentacar.backend.domain.UserSession;
import br.com.unipaulistana.rentacar.backend.dto.ChangePasswordRequestDto;
import br.com.unipaulistana.rentacar.backend.dto.UpdateProfileRequestDto;
import br.com.unipaulistana.rentacar.backend.dto.UserResponseDto;
import br.com.unipaulistana.rentacar.backend.repository.UserRepository;
import br.com.unipaulistana.rentacar.backend.repository.UserSessionRepository;
import br.com.unipaulistana.rentacar.backend.service.AuthService;
import br.com.unipaulistana.rentacar.backend.service.LoginRateLimiterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository repository;
    private final UserSessionRepository sessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final LoginRateLimiterService rateLimiterService;

    // ── Profile update ────────────────────────────────────────────────────────

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(@Valid @RequestBody UpdateProfileRequestDto dto) {
        // V-06 fix: validate avatar before touching anything else
        if (dto.profileImageUrl() != null && !dto.profileImageUrl().isBlank()) {
            String validationError = validateAvatarImage(dto.profileImageUrl());
            if (validationError != null) {
                return ResponseEntity.badRequest().body(Map.of("error", validationError));
            }
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = repository.findByEmail(email).orElseThrow();

        if (dto.fullName() != null && !dto.fullName().isBlank()) {
            user.setFullName(dto.fullName().strip());
        }
        if (dto.phone() != null) {
            user.setPhone(dto.phone().strip());
        }
        if (dto.cpf() != null) {
            user.setCpf(dto.cpf().replaceAll("\\D", ""));
        }
        if (dto.birthDate() != null) {
            user.setBirthDate(dto.birthDate());
        }
        if (dto.profileImageUrl() != null) {
            user.setProfileImageUrl(dto.profileImageUrl());
        }

        // V-01 fix: return DTO, never the entity (which contains password hash)
        return ResponseEntity.ok(UserResponseDto.from(repository.save(user)));
    }

    // ── Password change ───────────────────────────────────────────────────────

    @PostMapping("/me/change-password")
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody ChangePasswordRequestDto dto,
            jakarta.servlet.http.HttpServletRequest request) {

        // V-10 fix: rate-limit change-password to prevent brute-forcing the current password
        String ip = request.getRemoteAddr();
        if (rateLimiterService.isBlocked("pwd:" + ip)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Muitas tentativas. Aguarde 15 minutos."));
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = repository.findByEmail(email).orElseThrow();

        if (!passwordEncoder.matches(dto.currentPassword(), user.getPassword())) {
            rateLimiterService.loginFailed("pwd:" + ip);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Senha atual incorreta."));
        }

        user.setPassword(passwordEncoder.encode(dto.newPassword()));
        repository.save(user);

        // V-09 fix: invalidate ALL other active sessions after password change.
        // We identify the current session by the token in the cookie or Authorization header,
        // then deactivate all OTHER sessions so the user stays logged in on this device.
        String currentToken = extractCurrentToken(request);
        if (currentToken != null) {
            sessionRepository.findByTokenAndActiveTrue(currentToken).ifPresentOrElse(
                    currentSession -> sessionRepository.deactivateAllByUserExceptCurrent(user, currentSession.getId()),
                    () -> sessionRepository.deactivateAllByUser(user)
            );
        } else {
            sessionRepository.deactivateAllByUser(user);
        }

        return ResponseEntity.ok(Map.of("message", "Senha atualizada com sucesso. Outras sessoes foram encerradas."));
    }

    // ── Sessions ──────────────────────────────────────────────────────────────

    @GetMapping("/me/sessions")
    public ResponseEntity<?> getSessions(jakarta.servlet.http.HttpServletRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = repository.findByEmail(email).orElseThrow();

        String currentToken = extractCurrentToken(request);
        List<UserSession> sessions = sessionRepository.findByUserAndActiveTrueOrderByCreatedAtDesc(user);

        List<Map<String, Object>> responseList = sessions.stream().map(s -> {
            boolean isCurrent = currentToken != null && currentToken.equals(s.getToken());
            return Map.<String, Object>of(
                    "id", s.getId(),
                    "device", s.getDevice() != null ? s.getDevice() : "Dispositivo Desconhecido",
                    "createdAt", s.getCreatedAt().toString(),
                    "isCurrent", isCurrent
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    @DeleteMapping("/me/sessions/{id}")
    public ResponseEntity<?> terminateSession(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = repository.findByEmail(email).orElseThrow();

        UserSession session = sessionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Sessão não encontrada."));

        session.setActive(false);
        sessionRepository.save(session);
        return ResponseEntity.ok(Map.of("message", "Sessão encerrada com sucesso."));
    }

    // ── Admin-only ────────────────────────────────────────────────────────────

    /**
     * V-02 fix: restricted to ADMIN role only.
     * Also returns List<UserResponseDto> — never List<User> (which would expose password hashes).
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDto>> getAll() {
        List<UserResponseDto> users = repository.findAll().stream()
                .map(UserResponseDto::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    // ── Avatar validation ─────────────────────────────────────────────────────

    /**
     * V-06 fix: validates avatar image using magic bytes (file signature), not just size.
     * Decodes the base64 payload and checks the first bytes against known safe image formats.
     *
     * @return null if valid, error message string if invalid
     */
    private String validateAvatarImage(String dataUrl) {
        // Must follow data URI scheme: data:[<mediatype>];base64,<data>
        if (!dataUrl.startsWith("data:")) {
            return "Formato de imagem inválido.";
        }

        int commaIndex = dataUrl.indexOf(',');
        if (commaIndex < 0 || commaIndex >= dataUrl.length() - 1) {
            return "Formato de imagem inválido.";
        }

        String header = dataUrl.substring(5, commaIndex).toLowerCase();

        // Reject SVG: it can contain JavaScript
        if (header.contains("svg")) {
            return "Formato SVG não é permitido para fotos de perfil.";
        }

        // Only allow explicitly safe MIME types
        if (!header.startsWith("image/jpeg") && !header.startsWith("image/png")
                && !header.startsWith("image/webp") && !header.startsWith("image/gif")) {
            return "Apenas imagens JPEG, PNG, WebP e GIF são aceitas.";
        }

        String base64Data = dataUrl.substring(commaIndex + 1);

        // Check size: base64 string length * 0.75 approximates decoded byte size
        long approxBytes = Math.round(base64Data.length() * 0.75);
        if (approxBytes > 2L * 1024 * 1024) {
            return "A imagem não pode ser maior que 2MB.";
        }

        // Decode first 12 bytes to check magic bytes (file signature)
        try {
            String prefix = base64Data.length() > 20 ? base64Data.substring(0, 20) : base64Data;
            byte[] decoded = Base64.getDecoder().decode(prefix + "==");
            if (decoded.length < 3) {
                return "Imagem inválida ou corrompida.";
            }

            if (!isValidImageSignature(decoded)) {
                return "O conteúdo do arquivo não corresponde a uma imagem válida.";
            }
        } catch (IllegalArgumentException e) {
            return "Dados de imagem inválidos (base64 corrompido).";
        }

        return null; // valid
    }

    /**
     * Checks file magic bytes (file signatures) for supported image formats.
     * This prevents attackers from disguising non-image files (e.g. SVG, HTML, PDF) as images.
     */
    private boolean isValidImageSignature(byte[] bytes) {
        // JPEG: FF D8 FF
        if (bytes.length >= 3
                && (bytes[0] & 0xFF) == 0xFF
                && (bytes[1] & 0xFF) == 0xD8
                && (bytes[2] & 0xFF) == 0xFF) {
            return true;
        }
        // PNG: 89 50 4E 47
        if (bytes.length >= 4
                && (bytes[0] & 0xFF) == 0x89
                && (bytes[1] & 0xFF) == 0x50
                && (bytes[2] & 0xFF) == 0x4E
                && (bytes[3] & 0xFF) == 0x47) {
            return true;
        }
        // GIF: 47 49 46 38
        if (bytes.length >= 4
                && bytes[0] == 'G' && bytes[1] == 'I'
                && bytes[2] == 'F' && bytes[3] == '8') {
            return true;
        }
        // WebP: RIFF????WEBP (bytes 0-3 = RIFF, bytes 8-11 = WEBP)
        // With only 20 base64 chars decoded we get ~15 bytes — enough for WebP check
        if (bytes.length >= 12
                && bytes[0] == 'R' && bytes[1] == 'I'
                && bytes[2] == 'F' && bytes[3] == 'F'
                && bytes[8] == 'W' && bytes[9] == 'E'
                && bytes[10] == 'B' && bytes[11] == 'P') {
            return true;
        }
        return false;
    }

    private String extractCurrentToken(jakarta.servlet.http.HttpServletRequest request) {
        // Check cookie first
        jakarta.servlet.http.Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (jakarta.servlet.http.Cookie c : cookies) {
                if ("token".equals(c.getName())) return c.getValue();
            }
        }
        // Fallback to Bearer header
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
