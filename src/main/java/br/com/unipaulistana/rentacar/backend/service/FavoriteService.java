package br.com.unipaulistana.rentacar.backend.service;

import br.com.unipaulistana.rentacar.backend.domain.Favorite;
import br.com.unipaulistana.rentacar.backend.domain.User;
import br.com.unipaulistana.rentacar.backend.domain.Vehicle;
import br.com.unipaulistana.rentacar.backend.repository.FavoriteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class FavoriteService {

    private final FavoriteRepository repository;
    private final VehicleService vehicleService;

    @Transactional
    public void toggleFavorite(User user, Long vehicleId) {
        Vehicle vehicle = vehicleService.getById(vehicleId);
        Optional<Favorite> existing = repository.findByUserAndVehicle(user, vehicle);
        if (existing.isPresent()) {
            repository.delete(existing.get());
        } else {
            repository.save(Favorite.builder().user(user).vehicle(vehicle).build());
        }
    }

    public List<Favorite> getMyFavorites(User user) {
        return repository.findByUserOrderByCreatedAtDesc(user);
    }

    public boolean isFavorited(User user, Long vehicleId) {
        Vehicle vehicle = vehicleService.getById(vehicleId);
        return repository.existsByUserAndVehicle(user, vehicle);
    }
}
