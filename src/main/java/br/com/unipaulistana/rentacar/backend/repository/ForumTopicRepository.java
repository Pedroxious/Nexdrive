package br.com.unipaulistana.rentacar.backend.repository;

import br.com.unipaulistana.rentacar.backend.domain.ForumTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForumTopicRepository extends JpaRepository<ForumTopic, Long> {
    List<ForumTopic> findAllByOrderByIsPinnedDescUpdatedAtDesc();
    List<ForumTopic> findByCategoryOrderByIsPinnedDescUpdatedAtDesc(String category);
    List<ForumTopic> findAllByOrderByLikesCountDesc();

    @Query("SELECT t FROM ForumTopic t WHERE (:category IS NULL OR t.category = :category) ORDER BY t.isPinned DESC, t.updatedAt DESC")
    List<ForumTopic> findFilteredTopics(@Param("category") String category);
}
