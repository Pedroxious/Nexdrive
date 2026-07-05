package br.com.unipaulistana.rentacar.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RentalPriceResponse {
    private BigDecimal baseCost;
    private BigDecimal insuranceCost;
    private BigDecimal additionalDriverCost;
    private BigDecimal totalCost;
    private Integer totalDays;
}
