package br.com.unipaulistana.rentacar.backend.dto;

import br.com.unipaulistana.rentacar.backend.domain.FuelType;
import br.com.unipaulistana.rentacar.backend.domain.Transmission;
import br.com.unipaulistana.rentacar.backend.domain.VehicleCategory;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class GenerateDescriptionRequestDto {
    private String brand;
    private String model;
    private Integer year;
    private VehicleCategory category;
    private Transmission transmission;
    private FuelType fuelType;
    private String color;
    private Long mileage;
    private BigDecimal pricePerDay;
    private String city;
    private String state;
    private Boolean isNew;
    private Integer seats;
    private Integer doors;
    private String description;
    
    /**
     * Session history of previously generated descriptions for anti-repetition quality control.
     */
    private List<String> previousDescriptions;
}
