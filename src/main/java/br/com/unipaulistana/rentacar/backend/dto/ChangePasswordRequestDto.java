package br.com.unipaulistana.rentacar.backend.dto;

import jakarta.validation.constraints.*;

/**
 * Input DTO for password change — enforces strength requirements.
 */
public record ChangePasswordRequestDto(

        @NotBlank(message = "Senha atual é obrigatória")
        String currentPassword,

        @NotBlank(message = "Nova senha é obrigatória")
        @Size(min = 8, max = 100, message = "Nova senha deve ter entre 8 e 100 caracteres")
        String newPassword
) {}
