package br.com.unipaulistana.rentacar.backend.config;

import br.com.unipaulistana.rentacar.backend.domain.RequestLog;
import br.com.unipaulistana.rentacar.backend.service.BotDetectionService;
import br.com.unipaulistana.rentacar.backend.service.TrafficMonitoringService;
import br.com.unipaulistana.rentacar.backend.service.TrafficRateLimiterService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Set;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
@RequiredArgsConstructor
@Slf4j
public class TrafficMonitoringFilter extends OncePerRequestFilter {

    private final TrafficRateLimiterService rateLimiterService;
    private final BotDetectionService botDetectionService;
    private final TrafficMonitoringService trafficMonitoringService;

    private static final Set<String> STATIC_EXTENSIONS = Set.of(
            ".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico",
            ".woff", ".woff2", ".ttf", ".eot", ".webp", ".map", ".txt"
    );

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String uri = request.getRequestURI().toLowerCase();
        
        // Skip static asset extensions
        for (String ext : STATIC_EXTENSIONS) {
            if (uri.endsWith(ext)) {
                return true;
            }
        }

        // Skip swagger/openapi assets
        return uri.startsWith("/swagger-ui") || uri.startsWith("/v3/api-docs");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        long startTime = System.currentTimeMillis();
        String clientIp = extractClientIp(request);
        String uri = request.getRequestURI();
        String method = request.getMethod();
        String userAgent = request.getHeader("User-Agent");

        // 1. Rate Limiting Check (Bucket4j)
        boolean allowed = rateLimiterService.tryAcquire(clientIp);
        if (!allowed) {
            long duration = System.currentTimeMillis() - startTime;
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", "60");
            response.getWriter().write("{\"error\":\"Too Many Requests\",\"message\":\"Rate limit exceeded. Please try again later.\",\"retryAfterSeconds\":60}");

            // Log blocked request
            RequestLog logEntry = RequestLog.builder()
                    .ipAddress(clientIp)
                    .endpoint(uri)
                    .method(method)
                    .userAgent(userAgent != null ? userAgent : "")
                    .statusCode(HttpStatus.TOO_MANY_REQUESTS.value())
                    .timestamp(LocalDateTime.now())
                    .responseTimeMs(duration)
                    .blockedByRateLimit(true)
                    .isSuspicious(true)
                    .suspiciousReason("Rate limit exceeded (" + rateLimiterService.getRateLimitPerMinute() + " req/min)")
                    .build();

            trafficMonitoringService.recordRequestAsync(logEntry);
            return;
        }

        // 2. Bot / Scraper Heuristic Check (Non-blocking flag)
        BotDetectionService.BotCheckResult botCheck = botDetectionService.evaluateRequest(clientIp, uri, userAgent);

        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            int statusCode = response.getStatus();

            RequestLog logEntry = RequestLog.builder()
                    .ipAddress(clientIp)
                    .endpoint(uri)
                    .method(method)
                    .userAgent(userAgent != null ? userAgent : "")
                    .statusCode(statusCode)
                    .timestamp(LocalDateTime.now())
                    .responseTimeMs(duration)
                    .blockedByRateLimit(false)
                    .isSuspicious(botCheck.isSuspicious())
                    .suspiciousReason(botCheck.reason())
                    .build();

            trafficMonitoringService.recordRequestAsync(logEntry);
        }
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            // Can contain multiple IPs comma-separated, the first is the real client
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp.trim();
        }

        String cfConnectingIp = request.getHeader("CF-Connecting-IP");
        if (cfConnectingIp != null && !cfConnectingIp.isBlank() && !"unknown".equalsIgnoreCase(cfConnectingIp)) {
            return cfConnectingIp.trim();
        }

        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }
}
