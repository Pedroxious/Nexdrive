package br.com.unipaulistana.rentacar.backend.repository;

import br.com.unipaulistana.rentacar.backend.domain.User;
import br.com.unipaulistana.rentacar.backend.domain.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Long> {

    Optional<UserSession> findByTokenAndActiveTrue(String token);

    Optional<UserSession> findByRefreshTokenAndActiveTrue(String refreshToken);

    List<UserSession> findByUserAndActiveTrueOrderByCreatedAtDesc(User user);

    Optional<UserSession> findByIdAndUser(Long id, User user);

    Optional<UserSession> findByRefreshToken(String refreshToken);

    /**
     * Bulk-invalidates all active sessions for a given user.
     * Used after password change to revoke all existing sessions.
     */
    @Modifying
    @Transactional
    @Query("UPDATE UserSession s SET s.active = false WHERE s.user = :user AND s.active = true")
    void deactivateAllByUser(@Param("user") User user);

    /**
     * Bulk-invalidates all active sessions for a user except the current one.
     * Used after password change to keep the current device logged in.
     */
    @Modifying
    @Transactional
    @Query("UPDATE UserSession s SET s.active = false WHERE s.user = :user AND s.active = true AND s.id <> :currentSessionId")
    void deactivateAllByUserExceptCurrent(@Param("user") User user, @Param("currentSessionId") Long currentSessionId);
}
