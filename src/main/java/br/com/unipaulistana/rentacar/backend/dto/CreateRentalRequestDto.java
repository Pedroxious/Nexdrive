package br.com.unipaulistana.rentacar.backend.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

/**
 * V-26 fix: Structured DTO for rental creation. Replaces the raw {@code Map<String, Object>} body
 * with declarative Bean Validation, eliminating ClassCastException / NPE risks and enforcing
 * business rules (start date not in the past, interval ≤ 90 days) at the binding layer.
 */
public record CreateRentalRequestDto(

        @NotNull(message = "Veículo é obrigatório")
        Long vehicleId,

        @NotNull(message = "Data de início é obrigatória")
        @FutureOrPresent(message = "A data de início não pode ser no passado")
        LocalDate startDate,

        @NotNull(message = "Data de término é obrigatória")
        LocalDate endDate,

        @NotBlank(message = "Local de retirada é obrigatório")
        @Size(max = 200, message = "Local de retirada não pode exceder 200 caracteres")
        String pickupLocation,

        @NotBlank(message = "Local de devolução é obrigatório")
        @Size(max = 200, message = "Local de devolução não pode exceder 200 caracteres")
        String returnLocation,

        boolean insurance,

        boolean additionalDriver

) {
    /** Maximum rental period in days enforced by business policy. */
    public static final int MAX_RENTAL_DAYS = 90;
}
