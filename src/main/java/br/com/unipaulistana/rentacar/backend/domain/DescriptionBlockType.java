package br.com.unipaulistana.rentacar.backend.domain;

public enum DescriptionBlockType {
    OPENING,        // Abertura e apresentação principal
    CONDITION,      // Estado de conservação, pintura, odômetro
    PERFORMANCE,    // Motorização, câmbio, dirigibilidade, consumo
    COMFORT,        // Espaço interno, acabamento, capacidade
    TECHNOLOGY,     // Conectividade, multimídia, recursos tecnológicos
    SAFETY,         // Sistemas de segurança, freios, estabilidade
    DIFFERENTIALS,  // Opcionais exclusivos, valorização, diferenciais
    CLOSING,        // Encerramento, chamada para ação, disponibilidade

    // Retained for backward compatibility with existing DB rows
    INTRO,
    OUTRO
}
