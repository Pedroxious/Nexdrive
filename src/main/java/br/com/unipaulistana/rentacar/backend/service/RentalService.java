package br.com.unipaulistana.rentacar.backend.service;

import br.com.unipaulistana.rentacar.backend.domain.Rental;
import br.com.unipaulistana.rentacar.backend.domain.RentalStatus;
import br.com.unipaulistana.rentacar.backend.domain.User;
import br.com.unipaulistana.rentacar.backend.domain.Vehicle;
import br.com.unipaulistana.rentacar.backend.exception.InvalidDateRangeException;
import br.com.unipaulistana.rentacar.backend.exception.VehicleNotAvailableException;
import br.com.unipaulistana.rentacar.backend.repository.RentalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class RentalService {

    private final RentalRepository repository;
    private final VehicleService vehicleService;

    public Map<String, Object> calculatePrice(Long vehicleId, LocalDate start, LocalDate end, boolean insurance,
            boolean additionalDriver) {
        if (end.isBefore(start))
            throw new InvalidDateRangeException("End date must be after start date");

        Vehicle vehicle = vehicleService.getById(vehicleId);
        int days = (int) ChronoUnit.DAYS.between(start, end);
        if (days == 0)
            days = 1;

        BigDecimal baseCost = vehicle.getPricePerDay().multiply(new BigDecimal(days));
        BigDecimal insuranceCost = insurance ? baseCost.multiply(new BigDecimal("0.15")) : BigDecimal.ZERO;
        BigDecimal addDriverCost = additionalDriver ? new BigDecimal("35.00").multiply(new BigDecimal(days))
                : BigDecimal.ZERO;
        BigDecimal totalCost = baseCost.add(insuranceCost).add(addDriverCost);

        return Map.of(
                "baseCost", baseCost,
                "insuranceCost", insuranceCost,
                "additionalDriverCost", addDriverCost,
                "totalCost", totalCost,
                "totalDays", days);
    }

    @Transactional
    public Rental createRental(User user, Long vehicleId, LocalDate start, LocalDate end,
            String pickup, String returnLoc, boolean insurance, boolean addDriver) {

        if (repository.existsOverlapping(vehicleId, start, end)) {
            throw new VehicleNotAvailableException("Vehicle not available for selected dates");
        }

        Map<String, Object> pricing = calculatePrice(vehicleId, start, end, insurance, addDriver);
        Vehicle vehicle = vehicleService.getById(vehicleId);

        Rental rental = Rental.builder()
                .user(user)
                .vehicle(vehicle)
                .startDate(start)
                .endDate(end)
                .totalDays((int) pricing.get("totalDays"))
                .totalPrice((BigDecimal) pricing.get("totalCost"))
                .status(RentalStatus.PENDING)
                .pickupLocation(pickup)
                .returnLocation(returnLoc)
                .insurance(insurance)
                .additionalDriver(addDriver)
                .build();

        return repository.save(rental);
    }

    public List<Rental> getMyRentals(User user) {
        return repository.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional
    public void cancelRental(Long id) {
        Rental rental = repository.findById(id).orElseThrow();
        if (rental.getStatus() == RentalStatus.PENDING || rental.getStatus() == RentalStatus.CONFIRMED) {
            rental.setStatus(RentalStatus.CANCELLED);
            repository.save(rental);
        }
    }
}
