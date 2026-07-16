package br.com.unipaulistana.rentacar.backend.dto;

import br.com.unipaulistana.rentacar.backend.domain.Vehicle;

import java.math.BigDecimal;

/**
 * Lightweight projection for the vehicle listing endpoint.
 * <p>
 * Excludes {@code galleryImages} so the listing query never triggers
 * the SUBSELECT that loads image rows for every vehicle on the page.
 * The full {@link Vehicle} entity (with gallery) is still returned by the
 * detail endpoint {@code GET /api/vehicles/{id}}.
 */
public record VehicleSummaryDto(
        Long id,
        String brand,
        String model,
        int year,
        BigDecimal pricePerDay,
        String imageUrl,
        String badge,
        String fuelType,
        String transmission,
        boolean available,
        boolean freeTestDrive,
        int seats,
        String categoryName,
        String city,
        String state,
        boolean isNew
) {
    /**
     * Maps a {@link Vehicle} entity to this DTO.
     * Never accesses {@code galleryImages}, so the lazy SUBSELECT is not triggered.
     */
    public static VehicleSummaryDto from(Vehicle v) {
        return new VehicleSummaryDto(
                v.getId(),
                v.getBrand(),
                v.getModel(),
                v.getYear(),
                v.getPricePerDay(),
                v.getImageUrl(),
                v.getBadge() != null ? v.getBadge().name() : null,
                v.getFuelType() != null ? v.getFuelType().name() : null,
                v.getTransmission() != null ? v.getTransmission().name() : null,
                v.isAvailable(),
                v.isFreeTestDrive(),
                v.getSeats(),
                v.getCategory() != null ? v.getCategory().name() : null,
                v.getCity(),
                v.getState(),
                v.isNew()
        );
    }
}
