package br.com.unipaulistana.rentacar.backend.service;

import br.com.unipaulistana.rentacar.backend.domain.DescriptionBlockType;
import br.com.unipaulistana.rentacar.backend.domain.DescriptionTemplate;
import br.com.unipaulistana.rentacar.backend.dto.GenerateDescriptionRequestDto;
import br.com.unipaulistana.rentacar.backend.repository.DescriptionTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DescriptionGeneratorService {

    private final DescriptionTemplateRepository repository;
    private static final Locale PT_BR = new Locale("pt", "BR");

    public String generateDescription(GenerateDescriptionRequestDto dto) {
        StringBuilder description = new StringBuilder();

        for (DescriptionBlockType blockType : DescriptionBlockType.values()) {
            List<DescriptionTemplate> templates = repository.findByBlockTypeOrderByPriorityDesc(blockType);

            List<DescriptionTemplate> matchingTemplates = templates.stream()
                    .filter(t -> matches(t, dto))
                    .collect(Collectors.toList());

            if (!matchingTemplates.isEmpty()) {
                int topPriority = matchingTemplates.get(0).getPriority();
                List<DescriptionTemplate> topMatches = matchingTemplates.stream()
                        .filter(t -> t.getPriority() == topPriority)
                        .collect(Collectors.toList());
                
                Collections.shuffle(topMatches);
                DescriptionTemplate selected = topMatches.get(0);

                description.append(replacePlaceholders(selected.getTemplateText(), dto)).append(" ");
            }
        }

        return description.toString().trim();
    }

    private boolean matches(DescriptionTemplate template, GenerateDescriptionRequestDto dto) {
        if (template.getCategoryFilter() != null && dto.getCategory() != null &&
                !template.getCategoryFilter().equalsIgnoreCase(dto.getCategory().name())) {
            return false;
        }
        if (template.getTransmissionFilter() != null && dto.getTransmission() != null &&
                !template.getTransmissionFilter().equalsIgnoreCase(dto.getTransmission().name())) {
            return false;
        }
        if (template.getFuelTypeFilter() != null && dto.getFuelType() != null &&
                !template.getFuelTypeFilter().equalsIgnoreCase(dto.getFuelType().name())) {
            return false;
        }
        if (template.getIsNewFilter() != null && dto.getIsNew() != null &&
                !template.getIsNewFilter().equals(dto.getIsNew())) {
            return false;
        }
        if (template.getMinYear() != null && dto.getYear() != null &&
                dto.getYear() < template.getMinYear()) {
            return false;
        }
        if (template.getMaxMileage() != null && dto.getMileage() != null &&
                dto.getMileage() > template.getMaxMileage()) {
            return false;
        }
        return true;
    }

    private String replacePlaceholders(String text, GenerateDescriptionRequestDto dto) {
        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(PT_BR);
        NumberFormat numberFormat = NumberFormat.getNumberInstance(PT_BR);

        return text
                .replace("{brand}", dto.getBrand() != null ? dto.getBrand() : "")
                .replace("{model}", dto.getModel() != null ? dto.getModel() : "")
                .replace("{year}", dto.getYear() != null ? String.valueOf(dto.getYear()) : "")
                .replace("{category}", dto.getCategory() != null ? dto.getCategory().name() : "")
                .replace("{transmission}", dto.getTransmission() != null ? dto.getTransmission().name() : "")
                .replace("{fuelType}", dto.getFuelType() != null ? dto.getFuelType().name() : "")
                .replace("{color}", dto.getColor() != null ? dto.getColor() : "")
                .replace("{mileage}", dto.getMileage() != null ? numberFormat.format(dto.getMileage()) + " km" : "")
                .replace("{pricePerDay}", dto.getPricePerDay() != null ? currencyFormat.format(dto.getPricePerDay()).replace("R$", "R$ ") + "/dia" : "")
                .replace("{city}", dto.getCity() != null ? dto.getCity() : "")
                .replace("{state}", dto.getState() != null ? dto.getState() : "")
                .replace("{seats}", dto.getSeats() != null ? String.valueOf(dto.getSeats()) : "")
                .replace("{doors}", dto.getDoors() != null ? String.valueOf(dto.getDoors()) : "");
    }
}
