package br.com.unipaulistana.rentacar.backend.presentation;

import br.com.unipaulistana.rentacar.backend.domain.*;
import br.com.unipaulistana.rentacar.backend.dto.VehicleDetailDto;
import br.com.unipaulistana.rentacar.backend.dto.VehicleSummaryDto;
import br.com.unipaulistana.rentacar.backend.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService service;

    // ── Public read endpoints ─────────────────────────────────────────────────

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

        // V-20: whitelist validation (already applied in previous round)
        if (sort == null || !sort.contains(",")) {
            throw new IllegalArgumentException("Parâmetro de ordenação inválido. Use o formato: campo,direção");
        }
        String[] sortParts = sort.split(",");
        if (sortParts.length != 2) {
            throw new IllegalArgumentException("Parâmetro de ordenação inválido. Use o formato: campo,direção");
        }
        String sortField = sortParts[0].trim();
        String sortDir   = sortParts[1].trim();

        if (!sortDir.equalsIgnoreCase("asc") && !sortDir.equalsIgnoreCase("desc")) {
            throw new IllegalArgumentException("Direção de ordenação inválida. Use 'asc' ou 'desc'.");
        }

        Set<String> allowedFields = Set.of("pricePerDay", "salePrice", "year", "mileage", "id");
        if (!allowedFields.contains(sortField)) {
            throw new IllegalArgumentException("Ordenação pelo campo '" + sortField + "' não é permitida.");
        }

        Sort sortOrder = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortField);

        return ResponseEntity.ok(service.getAll(
                brands, category, fuelType, transmission, seats, minPrice, maxPrice,
                city, state, isNew, freeTestDrive, available, badge,
                PageRequest.of(page, size, sortOrder)));
    }

    /**
     * V-27 fix: Returns VehicleDetailDto instead of raw Vehicle entity.
     * Includes all fields needed for the detail view (gallery, description, color, etc.)
     * without leaking internal JPA metadata or unintended fields.
     */
    @GetMapping("/{id}")
    public ResponseEntity<VehicleDetailDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(VehicleDetailDto.from(service.getById(id)));
    }

    /**
     * V-27 fix: Returns List<VehicleSummaryDto> instead of List<Vehicle>.
     * Featured vehicles use the same lightweight projection as the main listing.
     */
    @GetMapping("/featured")
    public ResponseEntity<List<VehicleSummaryDto>> getFeatured() {
        return ResponseEntity.ok(service.getFeatured().stream()
                .map(VehicleSummaryDto::from)
                .toList());
    }

    @GetMapping("/brands")
    public ResponseEntity<List<String>> getBrands() {
        return ResponseEntity.ok(service.getBrands());
    }

    /**
     * V-27 fix: Returns List<VehicleSummaryDto> instead of List<Vehicle>.
     */
    @GetMapping("/search")
    public ResponseEntity<List<VehicleSummaryDto>> search(@RequestParam String q) {
        return ResponseEntity.ok(service.search(q).stream()
                .map(VehicleSummaryDto::from)
                .toList());
    }

    /**
     * Gallery images endpoint: returns VehicleImage directly.
     * VehicleImage only contains id, imageUrl, and position — no PII or sensitive data.
     * The @JsonBackReference on VehicleImage.vehicle prevents circular serialization.
     */
    @GetMapping("/{id}/images")
    public ResponseEntity<List<VehicleImage>> getImages(@PathVariable Long id) {
        return ResponseEntity.ok(service.getGalleryImages(id));
    }

    // ── Admin write endpoints ─────────────────────────────────────────────────
    // V-28 (additional finding): These endpoints accept the raw Vehicle entity.
    // Since they are ADMIN-only (enforced by SecurityConfig + @PreAuthorize),
    // the mass-assignment risk is significantly mitigated, but a dedicated
    // VehicleRequestDto should be introduced in a follow-up if needed.

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vehicle> create(@RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(service.create(vehicle));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vehicle> update(@PathVariable Long id, @RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(service.update(id, vehicle));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
