package br.com.unipaulistana.rentacar.backend.repository;

import br.com.unipaulistana.rentacar.backend.domain.Vehicle;
import br.com.unipaulistana.rentacar.backend.domain.VehicleBadge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long>, JpaSpecificationExecutor<Vehicle> {

    List<Vehicle> findByBadgeIn(List<VehicleBadge> badges);

    @Query("SELECT DISTINCT v.brand FROM Vehicle v ORDER BY v.brand")
    List<String> findDistinctBrands();

    @Query("SELECT v FROM Vehicle v WHERE " +
            "LOWER(v.brand) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(v.model) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Vehicle> searchByQuery(@Param("q") String q);

    /**
     * Availability check with date-range exclusion (rental overlap).
     * Brand/other filters are now handled via Specification before calling this,
     * so only location and date params remain here.
     */
    @Query(value = "SELECT v FROM Vehicle v WHERE " +
            "(:city IS NULL OR v.city = :city) AND " +
            "(:state IS NULL OR v.state = :state) AND " +
            "v.id NOT IN (" +
            "  SELECT r.vehicle.id FROM Rental r " +
            "  WHERE r.status IN ('CONFIRMED', 'ACTIVE') " +
            "  AND r.startDate <= :endDate AND r.endDate >= :startDate" +
            ")",
            countQuery = "SELECT COUNT(v) FROM Vehicle v WHERE " +
            "(:city IS NULL OR v.city = :city) AND " +
            "(:state IS NULL OR v.state = :state) AND " +
            "v.id NOT IN (" +
            "  SELECT r.vehicle.id FROM Rental r " +
            "  WHERE r.status IN ('CONFIRMED', 'ACTIVE') " +
            "  AND r.startDate <= :endDate AND r.endDate >= :startDate" +
            ")")
    Page<Vehicle> findAvailableInDateRange(
            @Param("city") String city,
            @Param("state") String state,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);
}
