package br.com.unipaulistana.rentacar.backend.dto;

import br.com.unipaulistana.rentacar.backend.domain.FuelType;
import br.com.unipaulistana.rentacar.backend.domain.Transmission;
import br.com.unipaulistana.rentacar.backend.domain.VehicleCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.util.List;

public record CreateVehicleListingDto(
        @NotBlank(message = "Brand is mandatory") String brand,
        @NotBlank(message = "Model is mandatory") String model,
        @NotNull(message = "Year is mandatory") @Positive(message = "Year must be valid") Integer year,
        @NotNull(message = "Category is mandatory") VehicleCategory category,
        @NotNull(message = "Fuel type is mandatory") FuelType fuelType,
        @NotNull(message = "Transmission is mandatory") Transmission transmission,
        @NotBlank(message = "Color is mandatory") String color,
        @NotNull(message = "Mileage is mandatory") @PositiveOrZero(message = "Mileage must be zero or positive") Long mileage,
        @NotNull(message = "Price per day is mandatory") @Positive(message = "Price must be positive") BigDecimal pricePerDay,
        BigDecimal salePrice,
        @NotBlank(message = "City is mandatory") String city,
        @NotBlank(message = "State is mandatory") String state,
        String description,
        @NotNull(message = "Seats is mandatory") @Positive(message = "Seats must be valid") Integer seats,
        @NotNull(message = "Doors is mandatory") @Positive(message = "Doors must be valid") Integer doors,
        boolean isNew,
        boolean freeTestDrive,
        String imageUrl,
        List<String> galleryImages
) {}
