package br.com.unipaulistana.rentacar.backend.dto;

public record AuthorDto(
    Long id,
    String name,
    String avatarUrl,
    String roleTag,
    boolean isBot
) {}
