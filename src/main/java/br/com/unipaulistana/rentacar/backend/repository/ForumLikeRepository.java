package br.com.unipaulistana.rentacar.backend.repository;

import br.com.unipaulistana.rentacar.backend.domain.ForumLike;
import br.com.unipaulistana.rentacar.backend.domain.ForumTopic;
import br.com.unipaulistana.rentacar.backend.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ForumLikeRepository extends JpaRepository<ForumLike, Long> {
    Optional<ForumLike> findByTopicAndUser(ForumTopic topic, User user);
    boolean existsByTopicAndUser(ForumTopic topic, User user);
}
