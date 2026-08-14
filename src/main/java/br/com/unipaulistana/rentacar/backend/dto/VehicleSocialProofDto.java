package br.com.unipaulistana.rentacar.backend.dto;

public record VehicleSocialProofDto(
    Long vehicleId,
    long recentViewsCount,
    long recentBookingsCount
) {}
