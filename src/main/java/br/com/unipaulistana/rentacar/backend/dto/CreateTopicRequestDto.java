package br.com.unipaulistana.rentacar.backend.dto;

public record CreateTopicRequestDto(
    String title,
    String content,
    String category,
    String imageUrl
) {}
