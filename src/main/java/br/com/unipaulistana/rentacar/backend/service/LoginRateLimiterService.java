package br.com.unipaulistana.rentacar.backend.service;

import br.com.unipaulistana.rentacar.backend.domain.LoginAttempt;
import br.com.unipaulistana.rentacar.backend.repository.LoginAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class LoginRateLimiterService {
    private static final int MAX_ATTEMPTS = 5;
    private static final int BLOCK_DURATION_MINUTES = 15;

    private final LoginAttemptRepository repository;

    public boolean isBlocked(String key) {
        return repository.findById(key)
                .map(attempt -> {
                    if (attempt.getAttempts() >= MAX_ATTEMPTS) {
                        if (attempt.getLastAttempt().plusMinutes(BLOCK_DURATION_MINUTES).isAfter(LocalDateTime.now())) {
                            return true;
                        } else {
                            // Block expired, reset/delete from database
                            repository.delete(attempt);
                        }
                    }
                    return false;
                })
                .orElse(false);
    }

    public void loginFailed(String key) {
        LoginAttempt attempt = repository.findById(key)
                .orElseGet(() -> LoginAttempt.builder()
                        .attemptKey(key)
                        .attempts(0)
                        .build());
        attempt.setAttempts(attempt.getAttempts() + 1);
        attempt.setLastAttempt(LocalDateTime.now());
        repository.save(attempt);
    }

    public void loginSucceeded(String key) {
        if (repository.existsById(key)) {
            repository.deleteById(key);
        }
    }
}
