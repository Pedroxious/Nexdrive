package br.com.unipaulistana.rentacar.backend.dto.traffic;

import br.com.unipaulistana.rentacar.backend.domain.RequestLog;
import java.time.LocalDateTime;

public record RequestLogDto(
        Long id,
        String ipAddress,
        String endpoint,
        String method,
        String userAgent,
        String deviceType,
        String browser,
        String operatingSystem,
        String country,
        String countryCode,
        String city,
        int statusCode,
        LocalDateTime timestamp,
        long responseTimeMs,
        boolean blockedByRateLimit,
        boolean isSuspicious,
        boolean isInternal,
        String suspiciousReason
) {
    public static RequestLogDto from(RequestLog log) {
        return new RequestLogDto(
                log.getId(),
                log.getIpAddress(),
                log.getEndpoint(),
                log.getMethod(),
                log.getUserAgent(),
                log.getDeviceType() != null ? log.getDeviceType() : "Desktop",
                log.getBrowser() != null ? log.getBrowser() : "Navegador",
                log.getOperatingSystem() != null ? log.getOperatingSystem() : "Desconhecido",
                log.getCountry() != null ? log.getCountry() : "--",
                log.getCountryCode() != null ? log.getCountryCode() : "--",
                log.getCity() != null ? log.getCity() : "--",
                log.getStatusCode(),
                log.getTimestamp(),
                log.getResponseTimeMs(),
                log.isBlockedByRateLimit(),
                log.isSuspicious(),
                log.isInternal(),
                log.getSuspiciousReason()
        );
    }
}
