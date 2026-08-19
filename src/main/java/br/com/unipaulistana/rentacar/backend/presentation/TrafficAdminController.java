package br.com.unipaulistana.rentacar.backend.presentation;

import br.com.unipaulistana.rentacar.backend.dto.traffic.*;
import br.com.unipaulistana.rentacar.backend.service.TrafficMonitoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/traffic")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class TrafficAdminController {

    private final TrafficMonitoringService trafficMonitoringService;

    @GetMapping("/summary")
    public ResponseEntity<TrafficSummaryDto> getSummary() {
        return ResponseEntity.ok(trafficMonitoringService.getSummary());
    }

    @GetMapping("/hourly")
    public ResponseEntity<List<TrafficTimelinePointDto>> getHourlyTraffic() {
        return ResponseEntity.ok(trafficMonitoringService.getHourlyTraffic());
    }

    @GetMapping("/daily")
    public ResponseEntity<List<TrafficTimelinePointDto>> getDailyTraffic() {
        return ResponseEntity.ok(trafficMonitoringService.getDailyTraffic());
    }

    @GetMapping("/top-ips")
    public ResponseEntity<List<TopIpDto>> getTopIps(@RequestParam(defaultValue = "15") int limit) {
        return ResponseEntity.ok(trafficMonitoringService.getTopIps(limit));
    }

    @GetMapping("/top-routes")
    public ResponseEntity<List<TopRouteDto>> getTopRoutes(@RequestParam(defaultValue = "15") int limit) {
        return ResponseEntity.ok(trafficMonitoringService.getTopRoutes(limit));
    }

    @GetMapping("/recent-logs")
    public ResponseEntity<Page<RequestLogDto>> getRecentLogs(
            @RequestParam(defaultValue = "all") String filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(trafficMonitoringService.getRecentLogs(filter, page, size));
    }
}
