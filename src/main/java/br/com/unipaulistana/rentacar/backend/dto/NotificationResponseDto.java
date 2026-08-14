package br.com.unipaulistana.rentacar.backend.dto;

import br.com.unipaulistana.rentacar.backend.domain.Notification;
import br.com.unipaulistana.rentacar.backend.domain.NotificationType;

import java.time.LocalDateTime;

public record NotificationResponseDto(
    Long id,
    NotificationType type,
    String title,
    String message,
    boolean read,
    LocalDateTime createdAt,
    String referenceType,
    Long referenceId
) {
    public static NotificationResponseDto fromEntity(Notification n) {
        return new NotificationResponseDto(
            n.getId(),
            n.getType(),
            n.getTitle(),
            n.getMessage(),
            n.isRead(),
            n.getCreatedAt(),
            n.getReferenceType(),
            n.getReferenceId()
        );
    }
}
