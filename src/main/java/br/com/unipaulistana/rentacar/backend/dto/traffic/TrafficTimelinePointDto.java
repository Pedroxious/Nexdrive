package br.com.unipaulistana.rentacar.backend.dto.traffic;

public record TrafficTimelinePointDto(
        String label,
        String periodKey,
        long totalRequests,
        long blockedRequests,
        long suspiciousRequests
) {}
