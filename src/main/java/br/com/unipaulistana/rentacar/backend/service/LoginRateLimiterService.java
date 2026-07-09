package br.com.unipaulistana.rentacar.backend.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;

@Service
public class LoginRateLimiterService {
    private static final int MAX_ATTEMPTS = 5;
    private static final int BLOCK_DURATION_MINUTES = 15;

    private final ConcurrentHashMap<String, Attempt> attemptsMap = new ConcurrentHashMap<>();

    public boolean isBlocked(String key) {
        Attempt attempt = attemptsMap.get(key);
        if (attempt == null) {
            return false;
        }
        if (attempt.getAttempts() >= MAX_ATTEMPTS) {
            if (attempt.getLastAttempt().plusMinutes(BLOCK_DURATION_MINUTES).isAfter(LocalDateTime.now())) {
                return true;
            } else {
                // Block expired, reset
                attemptsMap.remove(key);
            }
        }
        return false;
    }

    public void loginFailed(String key) {
        attemptsMap.compute(key, (k, attempt) -> {
            if (attempt == null) {
                return new Attempt(1, LocalDateTime.now());
            }
            return new Attempt(attempt.getAttempts() + 1, LocalDateTime.now());
        });
    }

    public void loginSucceeded(String key) {
        attemptsMap.remove(key);
    }

    private static class Attempt {
        private final int attempts;
        private final LocalDateTime lastAttempt;

        public Attempt(int attempts, LocalDateTime lastAttempt) {
            this.attempts = attempts;
            this.lastAttempt = lastAttempt;
        }

        public int getAttempts() { return attempts; }
        public LocalDateTime getLastAttempt() { return lastAttempt; }
    }
}
