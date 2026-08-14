package br.com.unipaulistana.rentacar.backend.dto;

import java.time.LocalDateTime;

public record ForumCommentDto(
    Long id,
    Long topicId,
    AuthorDto author,
    String content,
    String imageUrl,
    LocalDateTime createdAt
) {}
