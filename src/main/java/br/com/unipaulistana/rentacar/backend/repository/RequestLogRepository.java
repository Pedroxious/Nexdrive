package br.com.unipaulistana.rentacar.backend.repository;

import br.com.unipaulistana.rentacar.backend.domain.RequestLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RequestLogRepository extends JpaRepository<RequestLog, Long> {

    long countByTimestampAfter(LocalDateTime since);

    long countByTimestampAfterAndBlockedByRateLimitTrue(LocalDateTime since);

    long countByTimestampAfterAndIsSuspiciousTrue(LocalDateTime since);

    @Query("SELECT COUNT(DISTINCT r.ipAddress) FROM RequestLog r WHERE r.timestamp >= :since")
    long countDistinctIpAddressByTimestampAfter(@Param("since") LocalDateTime since);

    @Modifying
    @Query("DELETE FROM RequestLog r WHERE r.timestamp < :cutoff")
    int deleteByTimestampBefore(@Param("cutoff") LocalDateTime cutoff);

    // Top active IPs in the time window
    @Query("SELECT r.ipAddress, COUNT(r), " +
           "SUM(CASE WHEN r.blockedByRateLimit = true THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN r.isSuspicious = true THEN 1 ELSE 0 END), " +
           "MAX(r.timestamp), MAX(r.userAgent) " +
           "FROM RequestLog r WHERE r.timestamp >= :since " +
           "GROUP BY r.ipAddress ORDER BY COUNT(r) DESC")
    List<Object[]> findTopIpAggregates(@Param("since") LocalDateTime since, Pageable pageable);

    // Top accessed routes in the time window
    @Query("SELECT r.endpoint, r.method, COUNT(r), AVG(r.responseTimeMs) " +
           "FROM RequestLog r WHERE r.timestamp >= :since " +
           "GROUP BY r.endpoint, r.method ORDER BY COUNT(r) DESC")
    List<Object[]> findTopRouteAggregates(@Param("since") LocalDateTime since, Pageable pageable);

    // Filtered logs stream (suspicious or blocked or all)
    Page<RequestLog> findByTimestampAfterOrderByTimestampDesc(LocalDateTime since, Pageable pageable);

    Page<RequestLog> findByTimestampAfterAndIsSuspiciousTrueOrderByTimestampDesc(LocalDateTime since, Pageable pageable);

    Page<RequestLog> findByTimestampAfterAndBlockedByRateLimitTrueOrderByTimestampDesc(LocalDateTime since, Pageable pageable);

    // All logs after timestamp for in-memory timeline aggregation
    List<RequestLog> findByTimestampAfterOrderByTimestampAsc(LocalDateTime since);
}
