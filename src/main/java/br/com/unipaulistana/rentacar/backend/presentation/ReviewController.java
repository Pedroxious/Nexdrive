package br.com.unipaulistana.rentacar.backend.presentation;

import br.com.unipaulistana.rentacar.backend.domain.Review;
import br.com.unipaulistana.rentacar.backend.domain.User;
import br.com.unipaulistana.rentacar.backend.dto.CreateReviewRequestDto;
import br.com.unipaulistana.rentacar.backend.repository.UserRepository;
import br.com.unipaulistana.rentacar.backend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService service;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    /**
     * V-24 fix: Accepts CreateReviewRequestDto instead of the raw Review entity.
     * The client can only supply vehicleId, rating, and comment.
     * The service builds a new entity — never updates an existing row via this path.
     * V-25 fix: @Min(1)/@Max(5) on rating field in the DTO enforced by @Valid.
     */
    @PostMapping
    public ResponseEntity<Review> create(@Valid @RequestBody CreateReviewRequestDto dto) {
        return ResponseEntity.ok(service.createReview(getCurrentUser(), dto));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<Map<String, Object>> getByVehicle(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(service.getByVehicle(vehicleId));
    }
}
