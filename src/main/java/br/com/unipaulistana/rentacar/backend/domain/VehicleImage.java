package br.com.unipaulistana.rentacar.backend.domain;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "VEHICLE_IMAGES")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    @JsonBackReference
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Vehicle vehicle;

    private int position;      // 2, 3, 4 ou 5

    @Column(name = "image_url")
    private String imageUrl;   // "" por padrão
}
