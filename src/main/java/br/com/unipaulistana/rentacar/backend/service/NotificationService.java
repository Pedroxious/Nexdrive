package br.com.unipaulistana.rentacar.backend.service;

import br.com.unipaulistana.rentacar.backend.domain.Notification;
import br.com.unipaulistana.rentacar.backend.domain.NotificationType;
import br.com.unipaulistana.rentacar.backend.domain.User;
import br.com.unipaulistana.rentacar.backend.dto.NotificationResponseDto;
import br.com.unipaulistana.rentacar.backend.dto.UnreadCountDto;
import br.com.unipaulistana.rentacar.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<NotificationResponseDto> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(NotificationResponseDto::fromEntity)
                .toList();
    }

    public UnreadCountDto getUnreadCount(User user) {
        long count = notificationRepository.countByUserAndReadFalse(user);
        return new UnreadCountDto(count);
    }

    @Transactional
    public NotificationResponseDto markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AccessDeniedException("Notificação não encontrada ou acesso negado."));

        if (notification.getUser() != null && !notification.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Notificação não pertence ao usuário.");
        }

        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        return NotificationResponseDto.fromEntity(saved);
    }

    @Transactional
    public void markAllAsRead(User user) {
        notificationRepository.markAllAsReadForUser(user);
    }

    @Transactional
    public Notification createNotification(User user, NotificationType type, String title, String message,
                                            String referenceType, Long referenceId) {
        // Enforce global rule: No emojis in title or message
        String cleanTitle = removeEmojis(title);
        String cleanMessage = removeEmojis(message);

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(cleanTitle)
                .message(cleanMessage)
                .read(false)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .build();

        return notificationRepository.save(notification);
    }

    /**
     * Sanitizes strings to strip out emoji characters and special symbols.
     */
    private String removeEmojis(String input) {
        if (input == null) return "";
        return input.replaceAll("[\\p{So}\\p{Cn}\\x{1F600}-\\x{1F64F}\\x{1F300}-\\x{1F5FF}\\x{1F680}-\\x{1F6FF}\\x{1F1E6}-\\x{1F1FF}]", "").trim();
    }
}
