package br.com.unipaulistana.rentacar.backend.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

/**
 * Input DTO for profile updates — only mutable, non-sensitive fields.
 * Email and password are handled in separate dedicated endpoints.
 */
public record UpdateProfileRequestDto(

        @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
        @Pattern(regexp = "^$|^[A-Za-zÀ-ÿ']+(?:\\s+[A-Za-zÀ-ÿ']+)+$", message = "Nome completo inválido. Digite seu nome e sobrenome sem números")
        String fullName,

        @Size(max = 20, message = "Telefone inválido")
        @Pattern(regexp = "^$|^\\(\\d{2}\\)\\s?\\d{4,5}-\\d{4}$|^\\d{10,11}$", message = "Telefone inválido. Digite um número de telefone com DDD válido")
        String phone,

        @Size(max = 14, message = "CPF inválido")
        @Pattern(regexp = "^$|^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$|^\\d{11}$", message = "CPF inválido")
        String cpf,

        LocalDate birthDate,

        String profileImageUrl
) {}
