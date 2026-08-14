package br.com.unipaulistana.rentacar.backend.repository;

import br.com.unipaulistana.rentacar.backend.domain.User;
import br.com.unipaulistana.rentacar.backend.domain.Vehicle;
import br.com.unipaulistana.rentacar.backend.domain.VehicleView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleViewRepository extends JpaRepository<VehicleView, Long> {

    Optional<VehicleView> findFirstByUserAndVehicleOrderByViewedAtDesc(User user, Vehicle vehicle);

    List<VehicleView> findByVehicle(Vehicle vehicle);

    long countByVehicleAndViewedAtAfter(Vehicle vehicle, LocalDateTime since);

    // ETAPA 4: Find all distinct users who viewed vehicles (for price monitoring)
    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT v.user FROM VehicleView v WHERE v.viewedAt > :since")
    List<User> findDistinctUsersWithViewsSince(@org.springframework.data.repository.query.Param("since") LocalDateTime since);

    List<VehicleView> findByUserOrderByViewedAtDesc(User user);
}
