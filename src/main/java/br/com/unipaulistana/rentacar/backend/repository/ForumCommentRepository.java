package br.com.unipaulistana.rentacar.backend.repository;

import br.com.unipaulistana.rentacar.backend.domain.ForumComment;
import br.com.unipaulistana.rentacar.backend.domain.ForumTopic;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForumCommentRepository extends JpaRepository<ForumComment, Long> {
    List<ForumComment> findByTopicOrderByCreatedAtAsc(ForumTopic topic);
    
    long countByTopic(ForumTopic topic);
    
    List<ForumComment> findByTopicOrderByCreatedAtDesc(ForumTopic topic, Pageable pageable);
}
