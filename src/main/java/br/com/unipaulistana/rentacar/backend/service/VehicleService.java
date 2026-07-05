package br.com.unipaulistana.rentacar.backend.service;

import br.com.unipaulistana.rentacar.backend.domain.Vehicle;
import br.com.unipaulistana.rentacar.backend.domain.VehicleBadge;
import br.com.unipaulistana.rentacar.backend.domain.VehicleCategory;
import br.com.unipaulistana.rentacar.backend.domain.FuelType;
import br.com.unipaulistana.rentacar.backend.domain.Transmission;
import br.com.unipaulistana.rentacar.backend.domain.VehicleImage;
import br.com.unipaulistana.rentacar.backend.exception.VehicleNotFoundException;
import br.com.unipaulistana.rentacar.backend.repository.VehicleImageRepository;
import br.com.unipaulistana.rentacar.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class VehicleService {

    private final VehicleRepository repository;
    private final VehicleImageRepository vehicleImageRepository;

    public List<VehicleImage> getGalleryImages(Long vehicleId) {
        // First verify that vehicle exists
        if (!repository.existsById(vehicleId)) {
            throw new VehicleNotFoundException("Vehicle not found with id: " + vehicleId);
        }
        return vehicleImageRepository.findByVehicleIdOrderByPositionAsc(vehicleId);
    }

    public Page<Vehicle> getAll(
            List<String> brands, VehicleCategory category, FuelType fuelType, Transmission transmission,
            Integer seats, BigDecimal minPrice, BigDecimal maxPrice, String city, String state,
            Boolean isNew, Boolean freeTestDrive, Boolean available, VehicleBadge badge,
            Pageable pageable) {
        List<String> effectiveBrands = (brands == null || brands.isEmpty()) ? null : brands;
        return repository.findAllWithFilters(
                effectiveBrands, category, fuelType, transmission, seats, minPrice, maxPrice,
                city, state, isNew, freeTestDrive, available, badge, pageable);
    }

    public Vehicle getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found with id: " + id));
    }

    public List<Vehicle> getFeatured() {
        return repository.findByBadgeIn(List.of(VehicleBadge.BEST_SELLER, VehicleBadge.HOT_DEAL));
    }

    public List<String> getBrands() {
        return repository.findDistinctBrands();
    }

    public List<Vehicle> search(String q) {
        return repository.searchByQuery(q);
    }

    public Vehicle create(Vehicle vehicle) {
        return repository.save(vehicle);
    }

    public Vehicle update(Long id, Vehicle vehicleRequest) {
        Vehicle vehicle = getById(id);
        // Map updates (simplified for this task)
        vehicle.setAvailable(vehicleRequest.isAvailable());
        vehicle.setPricePerDay(vehicleRequest.getPricePerDay());
        // ... other fields
        return repository.save(vehicle);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
