package br.com.unipaulistana.rentacar.backend.service;

import br.com.unipaulistana.rentacar.backend.repository.RequestLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrafficCleanupScheduler {

    private final RequestLogRepository requestLogRepository;

    /**
     * Daily maintenance cron running at 03:00 AM to purge request logs older than 30 days.
     * Prevents database disk bloat.
     */
    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void cleanupOldRequestLogs() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
        log.info("Starting scheduled cleanup of request logs older than {}", cutoff);
        try {
            int deleted = requestLogRepository.deleteByTimestampBefore(cutoff);
            log.info("Successfully purged {} expired request log records.", deleted);
        } catch (Exception e) {
            log.error("Error purging old request logs: {}", e.getMessage(), e);
        }
    }
}
