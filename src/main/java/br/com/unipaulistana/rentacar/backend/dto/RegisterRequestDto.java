package br.com.unipaulistana.rentacar.backend.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

/**
 * Input DTO for user registration — enforces size limits and format validation.
 * Never use the User entity directly as a @RequestBody.
 */
public record RegisterRequestDto(

        @NotBlank(message = "Nome completo é obrigatório")
        @Size(min = 2, max = 200, message = "Nome deve ter entre 2 e 200 caracteres")
        String fullName,

        @NotBlank(message = "E-mail é obrigatório")
        @Email(message = "E-mail inválido")
        @Size(max = 255, message = "E-mail não pode exceder 255 caracteres")
        String email,

        @NotBlank(message = "Senha é obrigatória")
        @Size(min = 8, max = 100, message = "Senha deve ter entre 8 e 100 caracteres")
        String password,

        @Size(max = 20, message = "Telefone não pode exceder 20 caracteres")
        @Pattern(regexp = "^[+\\d\\s()\\-]*$", message = "Telefone contém caracteres inválidos")
        String phone,

        @Size(max = 14, message = "CPF inválido")
        @Pattern(regexp = "^\\d{3}\\.?\\d{3}\\.?\\d{3}[-\\.]?\\d{2}$", message = "CPF inválido")
        String cpf,

        LocalDate birthDate
) {}
