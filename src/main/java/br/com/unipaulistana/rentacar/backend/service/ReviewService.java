package br.com.unipaulistana.rentacar.backend.service;

import br.com.unipaulistana.rentacar.backend.domain.Review;
import br.com.unipaulistana.rentacar.backend.domain.Vehicle;
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

    public Review createReview(Review review) {
        return repository.save(review);
    }

    public Map<String, Object> getByVehicle(Long vehicleId) {
        Vehicle vehicle = vehicleService.getById(vehicleId);
        List<Review> reviews = repository.findByVehicleOrderByCreatedAtDesc(vehicle);
        Double avg = repository.getAverageRating(vehicleId);
        return Map.of("reviews", reviews, "averageRating", avg != null ? avg : 0.0);
    }
}
