package br.com.unipaulistana.rentacar.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ForumTopicResponseDto(
    Long id,
    String title,
    String content,
    String category,
    AuthorDto author,
    boolean isPinned,
    boolean isSolved,
    int viewsCount,
    int likesCount,
    int repliesCount,
    int participantsCount,
    String imageUrl,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    List<AuthorDto> participantAvatars,
    String lastActivityAuthor,
    boolean userLiked
) {}
