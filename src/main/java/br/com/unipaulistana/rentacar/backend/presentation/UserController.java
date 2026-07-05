package br.com.unipaulistana.rentacar.backend.presentation;

import br.com.unipaulistana.rentacar.backend.domain.User;
import br.com.unipaulistana.rentacar.backend.domain.UserSession;
import br.com.unipaulistana.rentacar.backend.repository.UserRepository;
import br.com.unipaulistana.rentacar.backend.repository.UserSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

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

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(@RequestBody User userRequest) {
        if (userRequest.getProfileImageUrl() != null && userRequest.getProfileImageUrl().startsWith("data:")) {
            long approxSizeBytes = Math.round(userRequest.getProfileImageUrl().length() * 0.75);
            if (approxSizeBytes > 2 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("A imagem de perfil não pode ser maior que 2MB.");
            }
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = repository.findByEmail(email).orElseThrow();
        user.setFullName(userRequest.getFullName());
        user.setPhone(userRequest.getPhone());
        user.setCpf(userRequest.getCpf());
        user.setBirthDate(userRequest.getBirthDate());
        user.setProfileImageUrl(userRequest.getProfileImageUrl());
        return ResponseEntity.ok(repository.save(user));
    }

    @PostMapping("/me/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = repository.findByEmail(email).orElseThrow();

        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body("Senhas não fornecidas.");
        }

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body("Senha atual incorreta.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        repository.save(user);
        return ResponseEntity.ok(Map.of("message", "Senha atualizada com sucesso."));
    }

    @GetMapping("/me/sessions")
    public ResponseEntity<?> getSessions(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = repository.findByEmail(email).orElseThrow();
        
        final String currentToken = (authHeader != null && authHeader.startsWith("Bearer ")) ? authHeader.substring(7) : "";

        List<UserSession> sessions = sessionRepository.findByUserAndActiveTrueOrderByCreatedAtDesc(user);
        
        List<Map<String, Object>> response = sessions.stream().map(s -> {
            boolean isCurrent = s.getToken() != null && s.getToken().equals(currentToken);
            return Map.<String, Object>of(
                "id", s.getId(),
                "device", s.getDevice() != null ? s.getDevice() : "Dispositivo Desconhecido",
                "createdAt", s.getCreatedAt().toString(),
                "isCurrent", isCurrent
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
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

    @GetMapping
    public ResponseEntity<List<User>> getAll() {
        return ResponseEntity.ok(repository.findAll());
    }
}
