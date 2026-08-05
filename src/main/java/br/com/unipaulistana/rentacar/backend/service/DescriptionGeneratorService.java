package br.com.unipaulistana.rentacar.backend.service;

import br.com.unipaulistana.rentacar.backend.domain.DescriptionBlockType;
import br.com.unipaulistana.rentacar.backend.domain.DescriptionTemplate;
import br.com.unipaulistana.rentacar.backend.dto.GenerateDescriptionRequestDto;
import br.com.unipaulistana.rentacar.backend.repository.DescriptionTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DescriptionGeneratorService {

    private final DescriptionTemplateRepository repository;
    private static final Locale PT_BR = new Locale("pt", "BR");
    private final Random random = new Random();

    // List of dynamic structural flows for narrative variety
    private static final List<List<DescriptionBlockType>> FLOW_STRUCTURES = List.of(
            List.of(DescriptionBlockType.OPENING, DescriptionBlockType.CONDITION, DescriptionBlockType.PERFORMANCE, DescriptionBlockType.COMFORT, DescriptionBlockType.SAFETY, DescriptionBlockType.DIFFERENTIALS, DescriptionBlockType.CLOSING),
            List.of(DescriptionBlockType.OPENING, DescriptionBlockType.PERFORMANCE, DescriptionBlockType.TECHNOLOGY, DescriptionBlockType.COMFORT, DescriptionBlockType.CONDITION, DescriptionBlockType.CLOSING),
            List.of(DescriptionBlockType.OPENING, DescriptionBlockType.COMFORT, DescriptionBlockType.TECHNOLOGY, DescriptionBlockType.CONDITION, DescriptionBlockType.PERFORMANCE, DescriptionBlockType.DIFFERENTIALS, DescriptionBlockType.CLOSING),
            List.of(DescriptionBlockType.OPENING, DescriptionBlockType.CONDITION, DescriptionBlockType.TECHNOLOGY, DescriptionBlockType.PERFORMANCE, DescriptionBlockType.SAFETY, DescriptionBlockType.CLOSING),
            List.of(DescriptionBlockType.OPENING, DescriptionBlockType.DIFFERENTIALS, DescriptionBlockType.PERFORMANCE, DescriptionBlockType.COMFORT, DescriptionBlockType.CONDITION, DescriptionBlockType.CLOSING)
    );

    // Dynamic connective phrases inserted between blocks
    private static final List<String> CONNECTIVES = List.of(
            "Além disso,",
            "Vale destacar que",
            "Outro diferencial marcante é que",
            "No quesito dirigibilidade,",
            "Para a sua tranquilidade,",
            "No que tange ao conforto,",
            "Em termos de performance,",
            "Vale ressaltar que",
            "Somado a isso,"
    );

    public String generateDescription(GenerateDescriptionRequestDto dto) {
        List<String> previous = dto.getPreviousDescriptions() != null ? dto.getPreviousDescriptions() : Collections.emptyList();

        String bestCandidate = "";
        double lowestSimilarity = 1.0;

        // Try up to 12 internal combinations to guarantee anti-repetition & high narrative quality
        for (int attempt = 0; attempt < 12; attempt++) {
            String candidate = assembleCandidate(dto);
            double similarity = calculateMaxSimilarity(candidate, previous);

            if (similarity < 0.35 && passesQualityCheck(candidate)) {
                return candidate;
            }

            if (similarity < lowestSimilarity) {
                lowestSimilarity = similarity;
                bestCandidate = candidate;
            }
        }

        return !bestCandidate.isBlank() ? bestCandidate : fallbackGenerate(dto);
    }

    private String assembleCandidate(GenerateDescriptionRequestDto dto) {
        // Randomly choose a narrative flow structure
        List<DescriptionBlockType> flow = FLOW_STRUCTURES.get(random.nextInt(FLOW_STRUCTURES.size()));
        StringBuilder sb = new StringBuilder();
        int blockIndex = 0;

        for (DescriptionBlockType blockType : flow) {
            List<DescriptionTemplate> templates = repository.findByBlockTypeOrderByPriorityDesc(blockType);

            List<DescriptionTemplate> matching = templates.stream()
                    .filter(t -> matches(t, dto))
                    .collect(Collectors.toList());

            if (!matching.isEmpty()) {
                // Shuffle matching templates to avoid predictable selections
                Collections.shuffle(matching);
                DescriptionTemplate selected = matching.get(0);
                String text = replacePlaceholders(selected.getTemplateText(), dto).trim();

                if (!text.isBlank()) {
                    if (blockIndex > 0 && blockIndex < flow.size() - 1 && random.nextBoolean()) {
                        String connective = CONNECTIVES.get(random.nextInt(CONNECTIVES.size()));
                        // Prevent duplicate connectives
                        if (!sb.toString().contains(connective)) {
                            sb.append(" ").append(connective).append(" ").append(decapitalizeFirst(text));
                        } else {
                            sb.append(" ").append(text);
                        }
                    } else {
                        if (sb.length() > 0) sb.append(" ");
                        sb.append(text);
                    }
                    blockIndex++;
                }
            }
        }

        return sb.toString().trim();
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
                .replace("{brand}", dto.getBrand() != null && !dto.getBrand().equalsIgnoreCase("OUTRA") ? dto.getBrand() : "Veículo")
                .replace("{model}", dto.getModel() != null ? dto.getModel() : "")
                .replace("{year}", dto.getYear() != null ? String.valueOf(dto.getYear()) : "")
                .replace("{category}", dto.getCategory() != null ? dto.getCategory().name() : "geral")
                .replace("{transmission}", dto.getTransmission() != null ? (dto.getTransmission().name().equalsIgnoreCase("AUTOMATIC") ? "automático" : "manual") : "automático")
                .replace("{fuelType}", dto.getFuelType() != null ? dto.getFuelType().name().toLowerCase() : "flex")
                .replace("{color}", dto.getColor() != null ? dto.getColor() : "exclusiva")
                .replace("{mileage}", dto.getMileage() != null ? numberFormat.format(dto.getMileage()) + " km" : "baixa quilometragem")
                .replace("{pricePerDay}", dto.getPricePerDay() != null ? currencyFormat.format(dto.getPricePerDay()).replace("R$", "R$ ") + "/dia" : "valor sob consulta")
                .replace("{city}", dto.getCity() != null ? dto.getCity() : "sua região")
                .replace("{state}", dto.getState() != null ? dto.getState() : "SP")
                .replace("{seats}", dto.getSeats() != null ? String.valueOf(dto.getSeats()) : "5")
                .replace("{doors}", dto.getDoors() != null ? String.valueOf(dto.getDoors()) : "4");
    }

    private boolean passesQualityCheck(String text) {
        if (text == null || text.length() < 100) return false;
        // Check for double space artifacts
        if (text.contains("  ")) return false;
        return true;
    }

    private double calculateMaxSimilarity(String candidate, List<String> previousList) {
        if (previousList == null || previousList.isEmpty()) return 0.0;
        double maxSim = 0.0;
        Set<String> candWords = getWordSet(candidate);

        for (String prev : previousList) {
            Set<String> prevWords = getWordSet(prev);
            double sim = calculateJaccardSimilarity(candWords, prevWords);
            if (sim > maxSim) {
                maxSim = sim;
            }
        }
        return maxSim;
    }

    private Set<String> getWordSet(String text) {
        if (text == null) return Collections.emptySet();
        return Arrays.stream(text.toLowerCase().replaceAll("[^a-zà-ÿ0-9\\s]", "").split("\\s+"))
                .filter(w -> w.length() > 3)
                .collect(Collectors.toSet());
    }

    private double calculateJaccardSimilarity(Set<String> s1, Set<String> s2) {
        if (s1.isEmpty() || s2.isEmpty()) return 0.0;
        Set<String> intersection = new HashSet<>(s1);
        intersection.retainAll(s2);
        Set<String> union = new HashSet<>(s1);
        union.addAll(s2);
        return (double) intersection.size() / union.size();
    }

    private String decapitalizeFirst(String str) {
        if (str == null || str.isEmpty()) return str;
        return Character.toLowerCase(str.charAt(0)) + str.substring(1);
    }

    private String fallbackGenerate(GenerateDescriptionRequestDto dto) {
        String brand = dto.getBrand() != null ? dto.getBrand() : "Veículo";
        String model = dto.getModel() != null ? dto.getModel() : "";
        String city = dto.getCity() != null ? dto.getCity() : "sua cidade";
        return String.format("Espetacular %s %s em excelente estado de conservação, localizado em %city%. Veículo higienizado, revisado e pronto para uso imediato!", brand, model, city);
    }
}
