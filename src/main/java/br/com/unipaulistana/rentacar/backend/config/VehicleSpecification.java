package br.com.unipaulistana.rentacar.backend.config;

import br.com.unipaulistana.rentacar.backend.domain.*;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Composable JPA Specifications for Vehicle filtering.
 * <p>
 * Replaces the unstable JPQL pattern
 * {@code (:brands IS NULL OR v.brand IN :brands)} which misbehaves with
 * non-null empty collections in Hibernate. Each predicate is only added when
 * the corresponding parameter is non-null (and non-empty for collections).
 */
public final class VehicleSpecification {

    private VehicleSpecification() {}

    public static Specification<Vehicle> withFilters(
            List<String> brands,
            VehicleCategory category,
            FuelType fuelType,
            Transmission transmission,
            Integer seats,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String city,
            String state,
            Boolean isNew,
            Boolean freeTestDrive,
            Boolean available,
            VehicleBadge badge) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Brand: only add IN predicate when list is present and non-empty
            if (brands != null && !brands.isEmpty()) {
                predicates.add(root.get("brand").in(brands));
            }
            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            if (fuelType != null) {
                predicates.add(cb.equal(root.get("fuelType"), fuelType));
            }
            if (transmission != null) {
                predicates.add(cb.equal(root.get("transmission"), transmission));
            }
            if (seats != null) {
                predicates.add(cb.equal(root.get("seats"), seats));
            }
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("pricePerDay"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("pricePerDay"), maxPrice));
            }
            if (city != null && !city.isBlank()) {
                predicates.add(cb.equal(root.get("city"), city));
            }
            if (state != null && !state.isBlank()) {
                predicates.add(cb.equal(root.get("state"), state));
            }
            if (isNew != null) {
                predicates.add(cb.equal(root.get("isNew"), isNew));
            }
            if (freeTestDrive != null) {
                predicates.add(cb.equal(root.get("freeTestDrive"), freeTestDrive));
            }
            if (available != null) {
                predicates.add(cb.equal(root.get("available"), available));
            }
            if (badge != null) {
                predicates.add(cb.equal(root.get("badge"), badge));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
