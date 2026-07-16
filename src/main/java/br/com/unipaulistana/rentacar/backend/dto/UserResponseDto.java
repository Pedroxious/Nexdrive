package br.com.unipaulistana.rentacar.backend.dto;

import br.com.unipaulistana.rentacar.backend.domain.User;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Safe projection of User entity — never includes password hash or CPF.
 * birthDate is included since it belongs to the authenticated user viewing their own profile.
 * All auth/profile endpoints must return this record instead of the User entity directly.
 */
public record UserResponseDto(
        Long id,
        String fullName,
        String email,
        String phone,
        String role,
        String cpf,
        LocalDate birthDate,
        LocalDateTime lastLoginAt,
        String profileImageUrl,
        LocalDateTime createdAt
) {
    public static UserResponseDto from(User user) {
        return new UserResponseDto(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole() != null ? user.getRole().name() : null,
                maskCpf(user.getCpf()),
                user.getBirthDate(),
                user.getLastLoginAt(),
                user.getProfileImageUrl(),
                user.getCreatedAt()
        );
    }

    /**
     * Returns a masked CPF showing only first 3 and last 2 digits.
     * Example: "123.456.789-09" → "123.***.***-09"
     * Prevents full CPF exposure while allowing the user to verify their own data.
     */
    private static String maskCpf(String cpf) {
        if (cpf == null || cpf.isBlank()) return null;
        String digits = cpf.replaceAll("\\D", "");
        if (digits.length() != 11) return "***.***.***-**";
        return digits.substring(0, 3) + ".***.***-" + digits.substring(9, 11);
    }
}
