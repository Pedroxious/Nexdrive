package br.com.unipaulistana.rentacar.backend.util;

public class CpfUtils {

    /**
     * Validates a Brazilian CPF using Modulo 11 check digits calculation.
     */
    public static boolean isValidCpf(String rawCpf) {
        if (rawCpf == null || rawCpf.isBlank()) {
            return true; // Optional field check handled by @NotBlank if required
        }

        String cpf = rawCpf.replaceAll("\\D", "");

        if (cpf.length() != 11) {
            return false;
        }

        // Reject all repeated digits (e.g. 111.111.111-11)
        if (cpf.matches("^(\\d)\\1{10}$")) {
            return false;
        }

        try {
            int sum = 0;
            for (int i = 0; i < 9; i++) {
                sum += (cpf.charAt(i) - '0') * (10 - i);
            }
            int firstCheckDigit = 11 - (sum % 11);
            if (firstCheckDigit >= 10) firstCheckDigit = 0;

            if (firstCheckDigit != (cpf.charAt(9) - '0')) {
                return false;
            }

            sum = 0;
            for (int i = 0; i < 10; i++) {
                sum += (cpf.charAt(i) - '0') * (11 - i);
            }
            int secondCheckDigit = 11 - (sum % 11);
            if (secondCheckDigit >= 10) secondCheckDigit = 0;

            return secondCheckDigit == (cpf.charAt(10) - '0');
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Normalizes a full name: trims whitespace and reduces multiple internal spaces to a single space.
     */
    public static String normalizeName(String name) {
        if (name == null) return null;
        return name.trim().replaceAll("\\s+", " ");
    }
}
