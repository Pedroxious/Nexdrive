package br.com.unipaulistana.rentacar.backend.repository;

import br.com.unipaulistana.rentacar.backend.domain.Notification;
import br.com.unipaulistana.rentacar.backend.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    long countByUserAndReadFalse(User user);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.user = :user AND n.read = false")
    void markAllAsReadForUser(@Param("user") User user);

    // Prevent duplicate notifications of the same type for same user+reference
    boolean existsByUserAndTypeAndReferenceTypeAndReferenceId(User user, br.com.unipaulistana.rentacar.backend.domain.NotificationType type, String referenceType, Long referenceId);

    // Check if notification of type already sent to user recently
    @Query("SELECT CASE WHEN COUNT(n) > 0 THEN true ELSE false END FROM Notification n WHERE n.user = :user AND n.type = :type AND n.createdAt > :since")
    boolean existsRecentByUserAndType(@Param("user") User user, @Param("type") br.com.unipaulistana.rentacar.backend.domain.NotificationType type, @Param("since") java.time.LocalDateTime since);
}
