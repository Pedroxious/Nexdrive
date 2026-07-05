package br.com.unipaulistana.rentacar.backend.repository;

import br.com.unipaulistana.rentacar.backend.domain.Vehicle;
import br.com.unipaulistana.rentacar.backend.domain.VehicleCategory;
import br.com.unipaulistana.rentacar.backend.domain.FuelType;
import br.com.unipaulistana.rentacar.backend.domain.Transmission;
import br.com.unipaulistana.rentacar.backend.domain.VehicleBadge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.time.LocalDate;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    @Query("SELECT v FROM Vehicle v WHERE " +
            "(:brands IS NULL OR v.brand IN :brands) AND " +
            "(:category IS NULL OR v.category = :category) AND " +
            "(:fuelType IS NULL OR v.fuelType = :fuelType) AND " +
            "(:transmission IS NULL OR v.transmission = :transmission) AND " +
            "(:seats IS NULL OR v.seats = :seats) AND " +
            "(:minPrice IS NULL OR v.pricePerDay >= :minPrice) AND " +
            "(:maxPrice IS NULL OR v.pricePerDay <= :maxPrice) AND " +
            "(:city IS NULL OR v.city = :city) AND " +
            "(:state IS NULL OR v.state = :state) AND " +
            "(:isNew IS NULL OR v.isNew = :isNew) AND " +
            "(:freeTestDrive IS NULL OR v.freeTestDrive = :freeTestDrive) AND " +
            "(:available IS NULL OR v.available = :available) AND " +
            "(:badge IS NULL OR v.badge = :badge)")
    Page<Vehicle> findAllWithFilters(
            @Param("brands") List<String> brands,
            @Param("category") VehicleCategory category,
            @Param("fuelType") FuelType fuelType,
            @Param("transmission") Transmission transmission,
            @Param("seats") Integer seats,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("city") String city,
            @Param("state") String state,
            @Param("isNew") Boolean isNew,
            @Param("freeTestDrive") Boolean freeTestDrive,
            @Param("available") Boolean available,
            @Param("badge") VehicleBadge badge,
            Pageable pageable);

    List<Vehicle> findByBadgeIn(List<VehicleBadge> badges);

    @Query("SELECT DISTINCT v.brand FROM Vehicle v")
    List<String> findDistinctBrands();

    @Query("SELECT v FROM Vehicle v WHERE LOWER(v.brand) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(v.model) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Vehicle> searchByQuery(@Param("q") String q);

    @Query("SELECT v FROM Vehicle v WHERE " +
            "(:brands IS NULL OR v.brand IN :brands) AND " +
            "(:category IS NULL OR v.category = :category) AND " +
            "(:fuelType IS NULL OR v.fuelType = :fuelType) AND " +
            "(:transmission IS NULL OR v.transmission = :transmission) AND " +
            "(:seats IS NULL OR v.seats = :seats) AND " +
            "(:minPrice IS NULL OR v.pricePerDay >= :minPrice) AND " +
            "(:maxPrice IS NULL OR v.pricePerDay <= :maxPrice) AND " +
            "(:city IS NULL OR v.city = :city) AND " +
            "(:state IS NULL OR v.state = :state) AND " +
            "v.id NOT IN (SELECT r.vehicle.id FROM Rental r WHERE r.status IN ('CONFIRMED', 'ACTIVE') AND ((r.startDate <= :endDate AND r.endDate >= :startDate)))")
    Page<Vehicle> findAvailableWithFilters(
            @Param("brands") List<String> brands,
            @Param("category") VehicleCategory category,
            @Param("fuelType") FuelType fuelType,
            @Param("transmission") Transmission transmission,
            @Param("seats") Integer seats,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("city") String city,
            @Param("state") String state,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);
}
