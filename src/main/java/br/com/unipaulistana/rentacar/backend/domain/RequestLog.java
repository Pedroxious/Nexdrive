package br.com.unipaulistana.rentacar.backend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "request_logs",
        indexes = {
            @Index(name = "idx_request_logs_timestamp", columnList = "timestamp"),
            @Index(name = "idx_request_logs_ip", columnList = "ipAddress"),
            @Index(name = "idx_request_logs_endpoint", columnList = "endpoint"),
            @Index(name = "idx_request_logs_suspicious", columnList = "isSuspicious"),
            @Index(name = "idx_request_logs_blocked", columnList = "blockedByRateLimit")
        })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String ipAddress;

    @Column(nullable = false, length = 512)
    private String endpoint;

    @Column(nullable = false, length = 16)
    private String method;

    @Column(columnDefinition = "TEXT")
    private String userAgent;

    @Column(nullable = false)
    private int statusCode;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    private long responseTimeMs;

    @Builder.Default
    private boolean blockedByRateLimit = false;

    @Builder.Default
    private boolean isSuspicious = false;

    @Column(length = 255)
    private String suspiciousReason;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
