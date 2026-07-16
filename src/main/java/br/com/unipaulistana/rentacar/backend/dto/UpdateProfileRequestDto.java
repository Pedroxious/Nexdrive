package br.com.unipaulistana.rentacar.backend.dto;

import jakarta.validation.constraints.*;

/**
 * Input DTO for profile updates — only mutable, non-sensitive fields.
 * Email and password are handled in separate dedicated endpoints.
 */
public record UpdateProfileRequestDto(

        @Size(min = 2, max = 200, message = "Nome deve ter entre 2 e 200 caracteres")
        String fullName,

        @Size(max = 20, message = "Telefone não pode exceder 20 caracteres")
        @Pattern(regexp = "^[+\\d\\s()\\-]*$", message = "Telefone contém caracteres inválidos")
        String phone,

        @Size(max = 14, message = "CPF inválido")
        @Pattern(regexp = "^\\d{3}\\.?\\d{3}\\.?\\d{3}[-\\.]?\\d{2}$", message = "CPF inválido")
        String cpf,

        java.time.LocalDate birthDate,

        // profileImageUrl is validated separately (magic bytes check)
        String profileImageUrl
) {}
