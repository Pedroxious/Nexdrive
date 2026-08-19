package br.com.unipaulistana.rentacar.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class GeoIpResolutionService {

    public record GeoLocation(
            String country,
            String countryCode,
            String city
    ) {}

    private static final GeoLocation LOCAL_LOCATION = new GeoLocation("Brasil", "BR", "Localhost / Interno");
    private static final GeoLocation UNKNOWN_LOCATION = new GeoLocation("Desconhecido", "--", "Desconhecido");

    private final Map<String, GeoLocation> geoCache = new ConcurrentHashMap<>();
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public GeoIpResolutionService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(1500))
                .build();
    }

    public boolean isInternalIp(String ip) {
        if (ip == null || ip.isBlank()) return true;
        String cleanIp = ip.trim();
        return cleanIp.equals("0:0:0:0:0:0:0:1") ||
               cleanIp.equals("127.0.0.1") ||
               cleanIp.equals("::1") ||
               cleanIp.equalsIgnoreCase("localhost") ||
               cleanIp.startsWith("10.") ||
               cleanIp.startsWith("192.168.") ||
               cleanIp.startsWith("172.16.") ||
               cleanIp.startsWith("172.17.") ||
               cleanIp.startsWith("172.18.") ||
               cleanIp.startsWith("172.19.") ||
               cleanIp.startsWith("172.2") ||
               cleanIp.startsWith("172.30.") ||
               cleanIp.startsWith("172.31.");
    }

    public GeoLocation resolve(String ip) {
        if (ip == null || ip.isBlank()) {
            return UNKNOWN_LOCATION;
        }

        String cleanIp = ip.trim();

        if (isInternalIp(cleanIp)) {
            return LOCAL_LOCATION;
        }

        // Check cache first
        GeoLocation cached = geoCache.get(cleanIp);
        if (cached != null) {
            return cached;
        }

        // Memory protection for VPS
        if (geoCache.size() > 5000) {
            geoCache.clear();
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("http://ip-api.com/json/" + cleanIp + "?fields=status,country,countryCode,city"))
                    .timeout(Duration.ofMillis(1500))
                    .header("User-Agent", "Nexdrive-Traffic-Monitor")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                if ("success".equalsIgnoreCase(root.path("status").asText())) {
                    String country = root.path("country").asText("Desconhecido");
                    String countryCode = root.path("countryCode").asText("--");
                    String city = root.path("city").asText("Desconhecido");

                    GeoLocation loc = new GeoLocation(country, countryCode, city);
                    geoCache.put(cleanIp, loc);
                    return loc;
                }
            }
        } catch (Exception e) {
            log.debug("Could not resolve GeoIP for IP {}: {}", cleanIp, e.getMessage());
        }

        geoCache.put(cleanIp, UNKNOWN_LOCATION);
        return UNKNOWN_LOCATION;
    }
}
