package br.com.unipaulistana.rentacar.backend.dto.traffic;

public record TopRouteDto(
        String endpoint,
        String method,
        long totalRequests,
        double avgResponseTimeMs
) {}
