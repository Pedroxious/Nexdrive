package br.com.unipaulistana.rentacar.backend.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "login_attempts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginAttempt {

    @Id
    @Column(name = "attempt_key")
    private String attemptKey;

    private int attempts;

    @Column(name = "last_attempt")
    private LocalDateTime lastAttempt;
}
