package br.com.unipaulistana.rentacar.backend.presentation;

import br.com.unipaulistana.rentacar.backend.domain.Rental;
import br.com.unipaulistana.rentacar.backend.domain.User;
import br.com.unipaulistana.rentacar.backend.repository.UserRepository;
import br.com.unipaulistana.rentacar.backend.service.RentalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import br.com.unipaulistana.rentacar.backend.dto.RentalPriceRequest;
import br.com.unipaulistana.rentacar.backend.dto.RentalPriceResponse;

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

    @PostMapping
    public ResponseEntity<Rental> create(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(service.createRental(
                getCurrentUser(),
                Long.valueOf(request.get("vehicleId").toString()),
                LocalDate.parse(request.get("startDate").toString()),
                LocalDate.parse(request.get("endDate").toString()),
                request.get("pickupLocation").toString(),
                request.get("returnLocation").toString(),
                (Boolean) request.get("insurance"),
                (Boolean) request.get("additionalDriver")));
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
        return ResponseEntity.ok(service.getMyRentals(getCurrentUser()).stream()
                .filter(r -> r.getId().equals(id))
                .findFirst().orElseThrow());
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        service.cancelRental(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<Rental>> getAll() {
        // ADMIN logic check would go here in SecurityConfig or Method Security
        return ResponseEntity.ok(userRepository.findAll().stream()
                .flatMap(u -> service.getMyRentals(u).stream()).toList());
    }
}
