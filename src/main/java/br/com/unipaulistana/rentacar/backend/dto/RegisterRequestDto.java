package br.com.unipaulistana.rentacar.backend.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

/**
 * Input DTO for user registration — enforces strict size limits, character patterns, and security constraints.
 * Never use the User entity directly as a @RequestBody.
 */
public record RegisterRequestDto(

        @NotBlank(message = "Nome completo é obrigatório")
        @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
        @Pattern(regexp = "^[A-Za-zÀ-ÿ']+(?:\\s+[A-Za-zÀ-ÿ']+)+$", message = "Nome completo inválido. Digite seu nome e sobrenome sem números ou caracteres especiais")
        String fullName,

        @NotBlank(message = "E-mail é obrigatório")
        @Size(min = 5, max = 255, message = "E-mail deve ter entre 5 e 255 caracteres")
        @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", message = "Formato de e-mail inválido")
        String email,

        @NotBlank(message = "Senha é obrigatória")
        @Size(min = 8, max = 100, message = "Senha deve ter entre 8 e 100 caracteres")
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&._#-]).{8,100}$", 
                 message = "A senha deve conter ao menos 8 caracteres, incluindo letra maiúscula, letra minúscula, número e símbolo")
        String password,

        @Size(max = 20, message = "Telefone inválido")
        @Pattern(regexp = "^$|^\\(\\d{2}\\)\\s?\\d{4,5}-\\d{4}$|^\\d{10,11}$", message = "Telefone inválido. Digite um número de telefone com DDD válido")
        String phone,

        @Size(max = 14, message = "CPF inválido")
        @Pattern(regexp = "^$|^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$|^\\d{11}$", message = "CPF inválido")
        String cpf,

        LocalDate birthDate
) {}
