package br.com.unipaulistana.rentacar.backend.presentation;

import br.com.unipaulistana.rentacar.backend.domain.Rental;
import br.com.unipaulistana.rentacar.backend.domain.User;
import br.com.unipaulistana.rentacar.backend.dto.CreateRentalRequestDto;
import br.com.unipaulistana.rentacar.backend.dto.RentalPriceRequest;
import br.com.unipaulistana.rentacar.backend.dto.RentalPriceResponse;
import br.com.unipaulistana.rentacar.backend.repository.UserRepository;
import br.com.unipaulistana.rentacar.backend.service.RentalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/rentals")
@RequiredArgsConstructor
public class RentalController {

    private final RentalService service;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    /**
     * V-26 fix: Replaced raw Map<String,Object> body with @Valid CreateRentalRequestDto.
     * Bean Validation enforces: vehicleId non-null, startDate not in the past,
     * locations non-blank. Service layer validates date order and 90-day max.
     */
    @PostMapping
    public ResponseEntity<Rental> create(@Valid @RequestBody CreateRentalRequestDto dto) {
        return ResponseEntity.ok(service.createRental(
                getCurrentUser(),
                dto.vehicleId(),
                dto.startDate(),
                dto.endDate(),
                dto.pickupLocation(),
                dto.returnLocation(),
                dto.insurance(),
                dto.additionalDriver()));
    }

    @PostMapping("/calculate")
    public ResponseEntity<RentalPriceResponse> calculate(@RequestBody RentalPriceRequest req) {
        var map = service.calculatePrice(
                req.getVehicleId(),
                LocalDate.parse(req.getStartDate()),
                LocalDate.parse(req.getEndDate()),
                req.isInsurance(),
                req.isAdditionalDriver());

        RentalPriceResponse resp = new RentalPriceResponse(
                (java.math.BigDecimal) map.get("baseCost"),
                (java.math.BigDecimal) map.get("insuranceCost"),
                (java.math.BigDecimal) map.get("additionalDriverCost"),
                (java.math.BigDecimal) map.get("totalCost"),
                (Integer) map.get("totalDays")
        );
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Rental>> getMy() {
        return ResponseEntity.ok(service.getMyRentals(getCurrentUser()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Rental> getById(@PathVariable Long id) {
        // Filters from the current user's own rentals — no IDOR possible here
        return ResponseEntity.ok(service.getMyRentals(getCurrentUser()).stream()
                .filter(r -> r.getId().equals(id))
                .findFirst().orElseThrow());
    }

    /**
     * V-23 fix: Passes the current user to the service, which verifies ownership before
     * changing the rental status. Both "not found" and "wrong owner" return 403 —
     * the caller cannot enumerate valid rental IDs by probing this endpoint.
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        service.cancelRental(id, getCurrentUser());
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Rental>> getAll() {
        return ResponseEntity.ok(userRepository.findAll().stream()
                .flatMap(u -> service.getMyRentals(u).stream()).toList());
    }
}
