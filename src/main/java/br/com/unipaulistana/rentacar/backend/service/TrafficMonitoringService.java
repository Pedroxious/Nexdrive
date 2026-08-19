package br.com.unipaulistana.rentacar.backend.service;

import br.com.unipaulistana.rentacar.backend.domain.RequestLog;
import br.com.unipaulistana.rentacar.backend.dto.traffic.*;
import br.com.unipaulistana.rentacar.backend.repository.RequestLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrafficMonitoringService {

    private final RequestLogRepository requestLogRepository;

    private static final DateTimeFormatter HOUR_FORMATTER = DateTimeFormatter.ofPattern("HH:00");
    private static final DateTimeFormatter DAY_FORMATTER = DateTimeFormatter.ofPattern("dd/MM");
    private static final DateTimeFormatter DATE_KEY_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * Persists request log asynchronously to eliminate latency impact on incoming HTTP traffic.
     */
    @Async
    public void recordRequestAsync(RequestLog requestLog) {
        try {
            requestLogRepository.save(requestLog);
        } catch (Exception e) {
            log.warn("Failed to persist request log: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public TrafficSummaryDto getSummary() {
        LocalDateTime since24h = LocalDateTime.now().minusHours(24);
        LocalDateTime since30d = LocalDateTime.now().minusDays(30);

        long total24h = requestLogRepository.countByTimestampAfter(since24h);
        long blocked24h = requestLogRepository.countByTimestampAfterAndBlockedByRateLimitTrue(since24h);
        long suspicious24h = requestLogRepository.countByTimestampAfterAndIsSuspiciousTrue(since24h);
        long uniqueIps24h = requestLogRepository.countDistinctIpAddressByTimestampAfter(since24h);

        long total30d = requestLogRepository.countByTimestampAfter(since30d);
        long blocked30d = requestLogRepository.countByTimestampAfterAndBlockedByRateLimitTrue(since30d);
        long suspicious30d = requestLogRepository.countByTimestampAfterAndIsSuspiciousTrue(since30d);
        long uniqueIps30d = requestLogRepository.countDistinctIpAddressByTimestampAfter(since30d);

        return new TrafficSummaryDto(
                total24h, blocked24h, suspicious24h, uniqueIps24h,
                total30d, blocked30d, suspicious30d, uniqueIps30d
        );
    }

    @Transactional(readOnly = true)
    public List<TrafficTimelinePointDto> getHourlyTraffic() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime since24h = now.minusHours(23).withMinute(0).withSecond(0).withNano(0);

        List<RequestLog> logs = requestLogRepository.findByTimestampAfterOrderByTimestampAsc(since24h);

        // Pre-populate 24 hour buckets
        Map<String, BucketStats> buckets = new LinkedHashMap<>();
        for (int i = 0; i < 24; i++) {
            LocalDateTime slot = since24h.plusHours(i);
            String key = slot.format(DateTimeFormatter.ofPattern("yyyy-MM-dd-HH"));
            String label = slot.format(HOUR_FORMATTER);
            buckets.put(key, new BucketStats(label, key));
        }

        for (RequestLog r : logs) {
            String key = r.getTimestamp().format(DateTimeFormatter.ofPattern("yyyy-MM-dd-HH"));
            BucketStats stats = buckets.get(key);
            if (stats != null) {
                stats.total++;
                if (r.isBlockedByRateLimit()) stats.blocked++;
                if (r.isSuspicious()) stats.suspicious++;
            }
        }

        return buckets.values().stream()
                .map(b -> new TrafficTimelinePointDto(b.label, b.key, b.total, b.blocked, b.suspicious))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TrafficTimelinePointDto> getDailyTraffic() {
        LocalDate today = LocalDate.now();
        LocalDate since30d = today.minusDays(29);

        LocalDateTime since30dTime = since30d.atStartOfDay();
        List<RequestLog> logs = requestLogRepository.findByTimestampAfterOrderByTimestampAsc(since30dTime);

        // Pre-populate 30 day buckets
        Map<String, BucketStats> buckets = new LinkedHashMap<>();
        for (int i = 0; i < 30; i++) {
            LocalDate date = since30d.plusDays(i);
            String key = date.format(DATE_KEY_FORMATTER);
            String label = date.format(DAY_FORMATTER);
            buckets.put(key, new BucketStats(label, key));
        }

        for (RequestLog r : logs) {
            String key = r.getTimestamp().format(DATE_KEY_FORMATTER);
            BucketStats stats = buckets.get(key);
            if (stats != null) {
                stats.total++;
                if (r.isBlockedByRateLimit()) stats.blocked++;
                if (r.isSuspicious()) stats.suspicious++;
            }
        }

        return buckets.values().stream()
                .map(b -> new TrafficTimelinePointDto(b.label, b.key, b.total, b.blocked, b.suspicious))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TopIpDto> getTopIps(int limit) {
        LocalDateTime since = LocalDateTime.now().minusDays(30);
        List<Object[]> rawList = requestLogRepository.findTopIpAggregates(since, PageRequest.of(0, Math.min(limit, 50)));

        return rawList.stream().map(row -> new TopIpDto(
                (String) row[0],
                ((Number) row[1]).longValue(),
                ((Number) row[2]).longValue(),
                ((Number) row[3]).longValue(),
                (LocalDateTime) row[4],
                (String) row[5]
        )).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TopRouteDto> getTopRoutes(int limit) {
        LocalDateTime since = LocalDateTime.now().minusDays(30);
        List<Object[]> rawList = requestLogRepository.findTopRouteAggregates(since, PageRequest.of(0, Math.min(limit, 50)));

        return rawList.stream().map(row -> new TopRouteDto(
                (String) row[0],
                (String) row[1],
                ((Number) row[2]).longValue(),
                row[3] != null ? Math.round(((Number) row[3]).doubleValue() * 10.0) / 10.0 : 0.0
        )).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<RequestLogDto> getRecentLogs(String filter, int page, int size) {
        LocalDateTime since = LocalDateTime.now().minusDays(7);
        PageRequest pageRequest = PageRequest.of(page, Math.min(size, 100));

        Page<RequestLog> result;
        if ("suspicious".equalsIgnoreCase(filter)) {
            result = requestLogRepository.findByTimestampAfterAndIsSuspiciousTrueOrderByTimestampDesc(since, pageRequest);
        } else if ("blocked".equalsIgnoreCase(filter)) {
            result = requestLogRepository.findByTimestampAfterAndBlockedByRateLimitTrueOrderByTimestampDesc(since, pageRequest);
        } else {
            result = requestLogRepository.findByTimestampAfterOrderByTimestampDesc(since, pageRequest);
        }

        return result.map(RequestLogDto::from);
    }

    private static class BucketStats {
        String label;
        String key;
        long total = 0;
        long blocked = 0;
        long suspicious = 0;

        BucketStats(String label, String key) {
            this.label = label;
            this.key = key;
        }
    }
}
