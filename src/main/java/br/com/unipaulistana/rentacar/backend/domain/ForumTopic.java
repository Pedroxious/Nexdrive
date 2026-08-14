package br.com.unipaulistana.rentacar.backend.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "forum_topics")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForumTopic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    private String category; // e.g. "Servidor", "WordPress", "Domínios", "Aluguel", "Veículos", "Dicas"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_user_id")
    private User authorUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_bot_id")
    private ForumBot authorBot;

    private boolean isPinned;
    private boolean isSolved;

    @Builder.Default
    private int viewsCount = 0;

    @Builder.Default
    private int likesCount = 0;

    @Builder.Default
    private int repliesCount = 0;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
