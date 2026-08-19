package br.com.unipaulistana.rentacar.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

@Service
@Slf4j
public class BotDetectionService {

    private static final int ROUTE_TRAVERSAL_THRESHOLD = 20; // distinct routes
    private static final long TIME_WINDOW_MILLIS = 10_000L;  // 10 seconds

    private static final Pattern KNOWN_SCRAPER_BOT_PATTERN = Pattern.compile(
            "(?i)(curl|python-requests|aiohttp|scrapy|wget|httpclient|libwww-perl|go-http-client|postmanruntime|headlesschrome|phantomjs|puppeteer|selenium|bot|spider|crawler|mechanize|bytespider)"
    );

    private static final Pattern RECOGNIZABLE_BROWSER_PATTERN = Pattern.compile(
            "(?i)(mozilla|chrome|safari|firefox|edge|opera|webkit|android|iphone|ipad)"
    );

    // IP -> Deque of (Timestamp, Endpoint)
    private final Map<String, Deque<RouteEntry>> ipRouteHistory = new ConcurrentHashMap<>();

    private record RouteEntry(long timestamp, String endpoint) {}

    public record BotCheckResult(boolean isSuspicious, String reason) {
        public static BotCheckResult clean() {
            return new BotCheckResult(false, null);
        }
        public static BotCheckResult suspicious(String reason) {
            return new BotCheckResult(true, reason);
        }
    }

    /**
     * Evaluates incoming request characteristics against anti-scraping and bot heuristics.
     */
    public BotCheckResult evaluateRequest(String ipAddress, String endpoint, String userAgent) {
        // 1. Check User-Agent anomalies
        if (userAgent == null || userAgent.trim().isEmpty()) {
            return BotCheckResult.suspicious("Empty or missing User-Agent header");
        }

        String uaClean = userAgent.trim();
        if (KNOWN_SCRAPER_BOT_PATTERN.matcher(uaClean).find()) {
            return BotCheckResult.suspicious("Known bot/scraper/automated tool signature: " + uaClean);
        }

        if (!RECOGNIZABLE_BROWSER_PATTERN.matcher(uaClean).find()) {
            return BotCheckResult.suspicious("Unrecognizable/generic User-Agent: " + uaClean);
        }

        // 2. Check rapid unique route traversal heuristic (>20 unique routes in 10s)
        if (ipAddress != null && !ipAddress.isBlank() && endpoint != null) {
            long now = System.currentTimeMillis();
            Deque<RouteEntry> history = ipRouteHistory.computeIfAbsent(ipAddress, k -> new ArrayDeque<>());

            synchronized (history) {
                // Prune entries older than 10 seconds
                while (!history.isEmpty() && now - history.peekFirst().timestamp() > TIME_WINDOW_MILLIS) {
                    history.pollFirst();
                }

                history.addLast(new RouteEntry(now, endpoint));

                // Count unique endpoints in the 10-second window
                Set<String> uniqueRoutes = new HashSet<>();
                for (RouteEntry entry : history) {
                    uniqueRoutes.add(entry.endpoint());
                }

                if (uniqueRoutes.size() > ROUTE_TRAVERSAL_THRESHOLD) {
                    return BotCheckResult.suspicious(
                            "Rapid unique route traversal (" + uniqueRoutes.size() + " routes in 10s)"
                    );
                }
            }

            // Memory guard for ipRouteHistory map
            if (ipRouteHistory.size() > 20000) {
                ipRouteHistory.clear();
            }
        }

        return BotCheckResult.clean();
    }
}
