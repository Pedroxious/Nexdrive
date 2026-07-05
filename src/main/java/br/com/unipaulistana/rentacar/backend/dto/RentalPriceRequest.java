package br.com.unipaulistana.rentacar.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RentalPriceRequest {
    private Long vehicleId;
    private String startDate; // ISO yyyy-MM-dd
    private String endDate;   // ISO yyyy-MM-dd
    private boolean insurance;
    private boolean additionalDriver;
}
