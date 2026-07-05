package br.com.unipaulistana.rentacar.backend.repository;

import br.com.unipaulistana.rentacar.backend.domain.Rental;
import br.com.unipaulistana.rentacar.backend.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
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
}
