package br.com.unipaulistana.rentacar.backend.dto;

import br.com.unipaulistana.rentacar.backend.domain.Vehicle;
import br.com.unipaulistana.rentacar.backend.domain.VehicleImage;

import java.math.BigDecimal;
import java.util.List;

/**
 * V-27 fix: Full detail projection for the vehicle detail page.
 * Extends {@link VehicleSummaryDto} fields with additional attributes needed on the detail view
 * (description, color, mileage, doors, salePrice, gallery images).
 * <p>
 * VehicleImage is included directly since it only contains id, imageUrl, and position — no PII.
 * The back-reference to Vehicle is annotated with {@code @JsonBackReference} on the entity side
 * so the circular reference does not appear in the JSON output.
 */
public record VehicleDetailDto(
        Long id,
        String brand,
        String model,
        int year,
        String color,
        Long mileage,
        int doors,
        int seats,
        BigDecimal pricePerDay,
        BigDecimal salePrice,
        String imageUrl,
        String badge,
        String fuelType,
        String transmission,
        boolean available,
        boolean freeTestDrive,
        boolean isNew,
        String description,
        String city,
        String state,
        String categoryName,
        String licensePlate,
        List<GalleryImageDto> gallery
) {
    /**
     * Lightweight nested record for gallery images. Avoids exposing the VehicleImage entity
     * and its back-reference / internal JPA metadata.
     */
    public record GalleryImageDto(Long id, String imageUrl, int position) {
        public static GalleryImageDto from(VehicleImage img) {
            return new GalleryImageDto(img.getId(), img.getImageUrl(), img.getPosition());
        }
    }

    public static VehicleDetailDto from(Vehicle v) {
        List<GalleryImageDto> gallery = (v.getGalleryImages() == null || v.getGalleryImages().isEmpty())
                ? List.of()
                : v.getGalleryImages().stream().map(GalleryImageDto::from).toList();

        return new VehicleDetailDto(
                v.getId(),
                v.getBrand(),
                v.getModel(),
                v.getYear(),
                v.getColor(),
                v.getMileage(),
                v.getDoors(),
                v.getSeats(),
                v.getPricePerDay(),
                v.getSalePrice(),
                v.getImageUrl(),
                v.getBadge()        != null ? v.getBadge().name()        : null,
                v.getFuelType()     != null ? v.getFuelType().name()     : null,
                v.getTransmission() != null ? v.getTransmission().name() : null,
                v.isAvailable(),
                v.isFreeTestDrive(),
                v.isNew(),
                v.getDescription(),
                v.getCity(),
                v.getState(),
                v.getCategory()     != null ? v.getCategory().name()     : null,
                v.getLicensePlate(),
                gallery
        );
    }
}
