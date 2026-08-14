package br.com.unipaulistana.rentacar.backend.repository;

import br.com.unipaulistana.rentacar.backend.domain.Rental;
import br.com.unipaulistana.rentacar.backend.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Long> {
    List<Rental> findByUserOrderByCreatedAtDesc(User user);

    @Query("SELECT COUNT(r) > 0 FROM Rental r WHERE r.vehicle.id = :vehicleId " +
            "AND r.status IN ('CONFIRMED', 'ACTIVE') " +
            "AND ((r.startDate <= :endDate AND r.endDate >= :startDate))")
    boolean existsOverlapping(
            @Param("vehicleId") Long vehicleId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    long countByVehicleIdAndCreatedAtAfter(Long vehicleId, LocalDateTime since);

    // ETAPA 5: Abandoned reservations (PENDING for over 2 hours)
    @Query("SELECT r FROM Rental r WHERE r.status = 'PENDING' AND r.createdAt < :threshold")
    List<Rental> findAbandonedPendingRentals(@Param("threshold") LocalDateTime threshold);

    // ETAPA 5: Completed rentals for post-rental review (completed 1-2 days ago)
    @Query("SELECT r FROM Rental r WHERE r.status = 'COMPLETED' AND r.endDate BETWEEN :from AND :to")
    List<Rental> findRecentlyCompletedRentals(@Param("from") LocalDate from, @Param("to") LocalDate to);

    List<Rental> findByStartDateAndStatusIn(LocalDate startDate, List<br.com.unipaulistana.rentacar.backend.domain.RentalStatus> statuses);
    List<Rental> findByEndDateAndStatusIn(LocalDate endDate, List<br.com.unipaulistana.rentacar.backend.domain.RentalStatus> statuses);
}
