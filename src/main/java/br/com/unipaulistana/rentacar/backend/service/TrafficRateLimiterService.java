package br.com.unipaulistana.rentacar.backend.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class TrafficRateLimiterService {

    @Value("${application.traffic.rate-limit-per-minute:100}")
    private int rateLimitPerMinute;

    private final Map<String, Bucket> bucketCache = new ConcurrentHashMap<>();

    /**
     * Checks if a request from the given IP address is permitted by the rate limiter.
     * Returns true if allowed, false if rate limit is exceeded.
     */
    public boolean tryAcquire(String ipAddress) {
        if (ipAddress == null || ipAddress.isBlank()) {
            return true;
        }

        // Periodically limit cache memory footprint if more than 50,000 distinct IPs connect
        if (bucketCache.size() > 50000) {
            bucketCache.clear();
        }

        Bucket bucket = bucketCache.computeIfAbsent(ipAddress, this::createBucket);
        return bucket.tryConsume(1);
    }

    public int getRateLimitPerMinute() {
        return rateLimitPerMinute;
    }

    private Bucket createBucket(String ip) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(rateLimitPerMinute)
                .refillGreedy(rateLimitPerMinute, Duration.ofMinutes(1))
                .build();
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
}
