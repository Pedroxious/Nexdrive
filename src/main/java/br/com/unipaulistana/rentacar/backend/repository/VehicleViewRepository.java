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
}
