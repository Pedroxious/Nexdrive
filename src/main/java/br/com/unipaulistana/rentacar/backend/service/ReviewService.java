package br.com.unipaulistana.rentacar.backend.service;

import br.com.unipaulistana.rentacar.backend.domain.Review;
import br.com.unipaulistana.rentacar.backend.domain.User;
import br.com.unipaulistana.rentacar.backend.domain.Vehicle;
import br.com.unipaulistana.rentacar.backend.dto.CreateReviewRequestDto;
import br.com.unipaulistana.rentacar.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ReviewService {

    private final ReviewRepository repository;
    private final VehicleService vehicleService;

    /**
     * V-24 fix: Creates a brand-new Review record from a safe DTO.
     * The id is never sourced from the client — always null at persist time,
     * guaranteeing this path only ever INSERTs, never UPDATEs an existing row.
     */
    public Review createReview(User user, CreateReviewRequestDto dto) {
        Vehicle vehicle = vehicleService.getById(dto.vehicleId());

        Review review = Review.builder()
                // id intentionally omitted → null → JPA generates a new identity
                .user(user)
                .vehicle(vehicle)
                .rating(dto.rating())
                .comment(dto.comment())
                .build();

        return repository.save(review);
    }

    public Map<String, Object> getByVehicle(Long vehicleId) {
        Vehicle vehicle = vehicleService.getById(vehicleId);
        List<Review> reviews = repository.findByVehicleOrderByCreatedAtDesc(vehicle);
        Double avg = repository.getAverageRating(vehicleId);
        return Map.of("reviews", reviews, "averageRating", avg != null ? avg : 0.0);
    }
}


