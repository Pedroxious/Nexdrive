package br.com.unipaulistana.rentacar.backend.domain;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "VEHICLES")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String brand;
    private String model;
    @Column(name = "`year`")
    private int year;

    @Enumerated(EnumType.STRING)
    private VehicleCategory category;

    private String color;

    @Enumerated(EnumType.STRING)
    private FuelType fuelType;

    @Enumerated(EnumType.STRING)
    private Transmission transmission;

    private int seats;
    private int doors;
    private Long mileage;
    private BigDecimal pricePerDay;
    private BigDecimal salePrice;

    @Enumerated(EnumType.STRING)
    private VehicleBadge badge;

    private boolean available;
    private String imageUrl;

    @Column(length = 1000)
    private String description;

    private boolean freeTestDrive;
    private boolean isNew;
    private String licensePlate;
    private String city;
    private String state;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    @JsonManagedReference
    @Fetch(FetchMode.SUBSELECT)
    @Builder.Default
    private List<VehicleImage> galleryImages = new ArrayList<>();
}

