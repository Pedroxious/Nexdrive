package br.com.unipaulistana.rentacar.backend.presentation;

import br.com.unipaulistana.rentacar.backend.domain.*;
import br.com.unipaulistana.rentacar.backend.dto.VehicleSummaryDto;
import br.com.unipaulistana.rentacar.backend.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService service;

    @GetMapping
    public ResponseEntity<Page<VehicleSummaryDto>> getAll(
            @RequestParam(required = false) List<String> brands,
            @RequestParam(required = false) VehicleCategory category,
            @RequestParam(required = false) FuelType fuelType,
            @RequestParam(required = false) Transmission transmission,
            @RequestParam(required = false) Integer seats,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) Boolean isNew,
            @RequestParam(required = false) Boolean freeTestDrive,
            @RequestParam(required = false) Boolean available,
            @RequestParam(required = false) VehicleBadge badge,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "pricePerDay,asc") String sort) {
        String[] sortParts = sort.split(",");
        Sort sortOrder = Sort.by(sortParts[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC,
                sortParts[0]);

        return ResponseEntity.ok(service.getAll(
                brands, category, fuelType, transmission, seats, minPrice, maxPrice,
                city, state, isNew, freeTestDrive, available, badge,
                PageRequest.of(page, size, sortOrder)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/{id}/images")
    public ResponseEntity<List<VehicleImage>> getImages(@PathVariable Long id) {
        return ResponseEntity.ok(service.getGalleryImages(id));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Vehicle>> getFeatured() {
        return ResponseEntity.ok(service.getFeatured());
    }

    @GetMapping("/brands")
    public ResponseEntity<List<String>> getBrands() {
        return ResponseEntity.ok(service.getBrands());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Vehicle>> search(@RequestParam String q) {
        return ResponseEntity.ok(service.search(q));
    }

    @PostMapping
    public ResponseEntity<Vehicle> create(@RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(service.create(vehicle));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> update(@PathVariable Long id, @RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(service.update(id, vehicle));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
