package br.com.unipaulistana.rentacar.backend.dto;

public record CreateCommentRequestDto(
    String content,
    String imageUrl
) {}
