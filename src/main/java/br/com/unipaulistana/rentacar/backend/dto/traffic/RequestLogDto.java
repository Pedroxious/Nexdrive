package br.com.unipaulistana.rentacar.backend.dto.traffic;

import br.com.unipaulistana.rentacar.backend.domain.RequestLog;
import java.time.LocalDateTime;

public record RequestLogDto(
        Long id,
        String ipAddress,
        String endpoint,
        String method,
        String userAgent,
        int statusCode,
        LocalDateTime timestamp,
        long responseTimeMs,
        boolean blockedByRateLimit,
        boolean isSuspicious,
        String suspiciousReason
) {
    public static RequestLogDto from(RequestLog log) {
        return new RequestLogDto(
                log.getId(),
                log.getIpAddress(),
                log.getEndpoint(),
                log.getMethod(),
                log.getUserAgent(),
                log.getStatusCode(),
                log.getTimestamp(),
                log.getResponseTimeMs(),
                log.isBlockedByRateLimit(),
                log.isSuspicious(),
                log.getSuspiciousReason()
        );
    }
}
