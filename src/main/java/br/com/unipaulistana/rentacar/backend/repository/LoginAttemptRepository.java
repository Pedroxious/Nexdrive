package br.com.unipaulistana.rentacar.backend.repository;

import br.com.unipaulistana.rentacar.backend.domain.LoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, String> {
}
