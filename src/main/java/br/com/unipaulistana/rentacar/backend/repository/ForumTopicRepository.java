package br.com.unipaulistana.rentacar.backend.repository;

import br.com.unipaulistana.rentacar.backend.domain.ForumTopic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ForumTopicRepository extends JpaRepository<ForumTopic, Long> {
    @Query("SELECT t FROM ForumTopic t WHERE LOWER(t.category) = LOWER(:category)")
    Page<ForumTopic> findByCategory(@Param("category") String category, Pageable pageable);

    @Query("SELECT t FROM ForumTopic t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<ForumTopic> searchByTitle(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT t FROM ForumTopic t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) AND LOWER(t.category) = LOWER(:category)")
    Page<ForumTopic> searchByTitleAndCategory(@Param("keyword") String keyword, @Param("category") String category, Pageable pageable);

    @Query("SELECT COUNT(t) FROM ForumTopic t WHERE LOWER(t.category) = LOWER(:category)")
    long countByCategory(@Param("category") String category);

    boolean existsByTitle(String title);
}
