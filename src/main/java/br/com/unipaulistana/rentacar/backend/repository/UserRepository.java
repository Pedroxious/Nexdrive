package br.com.unipaulistana.rentacar.backend.repository;

import br.com.unipaulistana.rentacar.backend.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    // ETAPA 5: Users inactive for X days
    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE u.lastLoginAt IS NOT NULL AND u.lastLoginAt < :threshold")
    java.util.List<User> findInactiveUsersSince(@org.springframework.data.repository.query.Param("threshold") java.time.LocalDateTime threshold);

    // ETAPA 5: Account anniversaries (created exactly X years ago today)
    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE FUNCTION('DATE', u.createdAt) = :anniversaryDate")
    java.util.List<User> findByCreatedAtDate(@org.springframework.data.repository.query.Param("anniversaryDate") java.time.LocalDate anniversaryDate);
}
