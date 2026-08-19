package br.com.unipaulistana.rentacar.backend.dto.traffic;

import java.time.LocalDateTime;

public record TrafficSummaryDto(
        long totalRequests24h,
        long blockedRequests24h,
        long suspiciousRequests24h,
        long uniqueIps24h,
        long totalRequests30d,
        long blockedRequests30d,
        long suspiciousRequests30d,
        long uniqueIps30d
) {}
