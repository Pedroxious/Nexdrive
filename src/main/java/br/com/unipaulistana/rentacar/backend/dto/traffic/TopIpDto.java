package br.com.unipaulistana.rentacar.backend.dto.traffic;

import java.time.LocalDateTime;

public record TopIpDto(
        String ipAddress,
        long totalRequests,
        long blockedCount,
        long suspiciousCount,
        LocalDateTime lastSeen,
        String sampleUserAgent
) {}
