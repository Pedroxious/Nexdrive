package br.com.unipaulistana.rentacar.backend.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "DESCRIPTION_TEMPLATES")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DescriptionTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private DescriptionBlockType blockType;

    @Column(length = 1000)
    private String templateText;

    private String categoryFilter;
    private String transmissionFilter;
    private String fuelTypeFilter;
    private Boolean isNewFilter;
    private Integer minYear;
    private Long maxMileage;

    @Builder.Default
    private int priority = 0;
}
