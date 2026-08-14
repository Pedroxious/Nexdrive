package br.com.unipaulistana.rentacar.backend.service;

import br.com.unipaulistana.rentacar.backend.domain.User;
import br.com.unipaulistana.rentacar.backend.domain.Vehicle;
import br.com.unipaulistana.rentacar.backend.domain.VehicleView;
import br.com.unipaulistana.rentacar.backend.dto.VehicleSocialProofDto;
import br.com.unipaulistana.rentacar.backend.repository.RentalRepository;
import br.com.unipaulistana.rentacar.backend.repository.VehicleRepository;
import br.com.unipaulistana.rentacar.backend.repository.VehicleViewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SocialProofService {

    private final VehicleViewRepository vehicleViewRepository;
    private final RentalRepository rentalRepository;
    private final VehicleRepository vehicleRepository;

    @Transactional
    public void recordView(User user, Long vehicleId) {
        if (user == null || vehicleId == null) return;

        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
        if (vehicle == null) return;

        VehicleView view = VehicleView.builder()
                .user(user)
                .vehicle(vehicle)
                .priceAtView(vehicle.getPricePerDay())
                .viewedAt(LocalDateTime.now())
                .build();

        vehicleViewRepository.save(view);
    }

    public VehicleSocialProofDto getSocialProof(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
        if (vehicle == null) {
            return new VehicleSocialProofDto(vehicleId, 0, 0);
        }

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        long recentViews = vehicleViewRepository.countByVehicleAndViewedAtAfter(vehicle, sevenDaysAgo);
        long recentBookings = rentalRepository.countByVehicleIdAndCreatedAtAfter(vehicleId, thirtyDaysAgo);

        return new VehicleSocialProofDto(vehicleId, recentViews, recentBookings);
    }
}
