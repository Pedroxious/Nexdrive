package br.com.unipaulistana.rentacar.backend.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users",
        indexes = {
            @jakarta.persistence.Index(name = "idx_user_email", columnList = "email")
        })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;

    @Column(unique = true)
    private String email;

    /** Never serialized to JSON — secondary defense after DTO layer. */
    @JsonIgnore
    private String password;

    private String phone;

    /** PII — never serialized to JSON. Use UserResponseDto for client responses. */
    @JsonIgnore
    private String cpf;

    /** PII — never serialized to JSON. */
    @JsonIgnore
    private LocalDate birthDate;

    private LocalDateTime lastLoginAt;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    private LocalDateTime createdAt;

    @Column(columnDefinition = "TEXT")
    private String profileImageUrl;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
