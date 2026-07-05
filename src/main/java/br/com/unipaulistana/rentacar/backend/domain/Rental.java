package br.com.unipaulistana.rentacar.backend.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "rentals")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Rental {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    private LocalDate startDate;
    private LocalDate endDate;
    private int totalDays;
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    private RentalStatus status;

    private String pickupLocation;
    private String returnLocation;
    private LocalDateTime createdAt;
    private boolean additionalDriver;
    private boolean insurance;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
