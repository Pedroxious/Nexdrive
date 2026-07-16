package br.com.unipaulistana.rentacar.backend.dto;

import jakarta.validation.constraints.*;

/**
 * V-24 fix: DTO for review creation. The client can only supply vehicleId, rating, and comment.
 * The id and user fields are never accepted from the client — the service always creates a new record.
 * V-25 fix: rating is constrained to [1, 5].
 */
public record CreateReviewRequestDto(

        @NotNull(message = "Veículo é obrigatório")
        Long vehicleId,

        @Min(value = 1, message = "A nota mínima é 1")
        @Max(value = 5, message = "A nota máxima é 5")
        int rating,

        @Size(max = 1000, message = "O comentário não pode exceder 1000 caracteres")
        String comment
) {}
