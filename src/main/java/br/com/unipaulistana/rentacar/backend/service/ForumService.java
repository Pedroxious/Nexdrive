package br.com.unipaulistana.rentacar.backend.service;

import br.com.unipaulistana.rentacar.backend.domain.*;
import br.com.unipaulistana.rentacar.backend.dto.*;
import br.com.unipaulistana.rentacar.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ForumService {

    private final ForumTopicRepository topicRepository;
    private final ForumCommentRepository commentRepository;
    private final ForumLikeRepository likeRepository;
    private final ForumBotRepository botRepository;

    @Transactional(readOnly = true)
    public List<ForumTopicResponseDto> getTopics(String category, String sort, User currentUser) {
        String filterCat = (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) ? category : null;
        List<ForumTopic> topics;

        if ("popular".equalsIgnoreCase(sort)) {
            topics = topicRepository.findPopularTopics(filterCat);
        } else {
            topics = topicRepository.findFilteredTopics(filterCat);
        }

        return topics.stream()
                .map(topic -> mapToTopicDto(topic, currentUser))
                .toList();
    }

    @Transactional
    public ForumTopicResponseDto getTopicById(Long id, User currentUser) {
        ForumTopic topic = topicRepository.findById(id).orElseThrow();
        topic.setViewsCount(topic.getViewsCount() + 1);
        topicRepository.save(topic);
        return mapToTopicDto(topic, currentUser);
    }

    @Transactional(readOnly = true)
    public List<ForumCommentDto> getTopicComments(Long topicId) {
        ForumTopic topic = topicRepository.findById(topicId).orElseThrow();
        return commentRepository.findByTopicOrderByCreatedAtAsc(topic)
                .stream()
                .map(this::mapToCommentDto)
                .toList();
    }

    @Transactional
    public ForumTopicResponseDto createTopic(User user, CreateTopicRequestDto dto) {
        validateImage(dto.imageUrl());

        ForumTopic topic = ForumTopic.builder()
                .title(dto.title().trim())
                .content(dto.content().trim())
                .category(dto.category() != null ? dto.category() : "Aluguel")
                .authorUser(user)
                .isPinned(false)
                .isSolved(false)
                .viewsCount(1)
                .likesCount(0)
                .repliesCount(0)
                .imageUrl(dto.imageUrl())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        ForumTopic saved = topicRepository.save(topic);
        return mapToTopicDto(saved, user);
    }

    @Transactional
    public ForumTopicResponseDto toggleLike(Long topicId, User user) {
        ForumTopic topic = topicRepository.findById(topicId).orElseThrow();
        Optional<ForumLike> existing = likeRepository.findByTopicAndUser(topic, user);

        if (existing.isPresent()) {
            likeRepository.delete(existing.get());
            topic.setLikesCount(Math.max(0, topic.getLikesCount() - 1));
        } else {
            ForumLike like = ForumLike.builder()
                    .topic(topic)
                    .user(user)
                    .createdAt(LocalDateTime.now())
                    .build();
            likeRepository.save(like);
            topic.setLikesCount(topic.getLikesCount() + 1);
        }

        ForumTopic saved = topicRepository.save(topic);
        return mapToTopicDto(saved, user);
    }

    @Transactional
    public ForumCommentDto addComment(Long topicId, User user, CreateCommentRequestDto dto) {
        validateImage(dto.imageUrl());
        ForumTopic topic = topicRepository.findById(topicId).orElseThrow();

        ForumComment comment = ForumComment.builder()
                .topic(topic)
                .authorUser(user)
                .content(dto.content().trim())
                .imageUrl(dto.imageUrl())
                .createdAt(LocalDateTime.now())
                .build();

        ForumComment saved = commentRepository.save(comment);

        topic.setRepliesCount(topic.getRepliesCount() + 1);
        topic.setUpdatedAt(LocalDateTime.now());
        topicRepository.save(topic);

        return mapToCommentDto(saved);
    }

    @Transactional(readOnly = true)
    public List<String> getCategories() {
        return List.of("Aluguel", "Veículos", "Dicas", "Suporte", "Servidor", "WordPress", "Domínios", "Cloudflare");
    }

    private ForumTopicResponseDto mapToTopicDto(ForumTopic topic, User currentUser) {
        AuthorDto author = mapAuthor(topic.getAuthorUser(), topic.getAuthorBot());
        List<AuthorDto> participantAvatars = getParticipantAvatars(topic);

        boolean userLiked = false;
        if (currentUser != null) {
            userLiked = likeRepository.existsByTopicAndUser(topic, currentUser);
        }

        return new ForumTopicResponseDto(
                topic.getId(),
                topic.getTitle(),
                topic.getContent(),
                topic.getCategory(),
                author,
                topic.isPinned(),
                topic.isSolved(),
                topic.getViewsCount(),
                topic.getLikesCount(),
                topic.getRepliesCount(),
                topic.getImageUrl(),
                topic.getCreatedAt(),
                topic.getUpdatedAt(),
                participantAvatars,
                userLiked
        );
    }

    private ForumCommentDto mapToCommentDto(ForumComment comment) {
        AuthorDto author = mapAuthor(comment.getAuthorUser(), comment.getAuthorBot());
        return new ForumCommentDto(
                comment.getId(),
                comment.getTopic().getId(),
                author,
                comment.getContent(),
                comment.getImageUrl(),
                comment.getCreatedAt()
        );
    }

    private AuthorDto mapAuthor(User user, ForumBot bot) {
        if (bot != null) {
            return new AuthorDto(bot.getId(), bot.getName(), bot.getAvatarUrl(), bot.getRoleTag(), true);
        }
        if (user != null) {
            String avatar = user.getProfileImageUrl();
            if (avatar == null || avatar.isBlank()) {
                avatar = "https://ui-avatars.com/api/?name=" + user.getFullName() + "&background=0284C7&color=fff";
            }
            return new AuthorDto(user.getId(), user.getFullName(), avatar, "Membro Nexdrive", false);
        }
        return new AuthorDto(0L, "Usuário Anônimo", "https://ui-avatars.com/api/?name=Anonimo", null, false);
    }

    private List<AuthorDto> getParticipantAvatars(ForumTopic topic) {
        List<ForumComment> comments = commentRepository.findByTopicOrderByCreatedAtAsc(topic);
        Set<String> seenKey = new HashSet<>();
        List<AuthorDto> avatars = new ArrayList<>();

        // Add topic author first
        AuthorDto mainAuthor = mapAuthor(topic.getAuthorUser(), topic.getAuthorBot());
        avatars.add(mainAuthor);
        seenKey.add(mainAuthor.name());

        for (ForumComment c : comments) {
            AuthorDto a = mapAuthor(c.getAuthorUser(), c.getAuthorBot());
            if (seenKey.add(a.name())) {
                avatars.add(a);
            }
            if (avatars.size() >= 5) break;
        }

        return avatars;
    }

    private void validateImage(String base64OrUrl) {
        if (base64OrUrl == null || base64OrUrl.isBlank()) return;

        if (base64OrUrl.startsWith("data:image/")) {
            String header = base64OrUrl.substring(0, base64OrUrl.indexOf(","));
            String mime = header.split(";")[0].replace("data:", "").toLowerCase();

            if (!List.of("image/png", "image/jpeg", "image/jpg", "image/webp").contains(mime)) {
                throw new IllegalArgumentException("Formato de imagem inválido. Formatos aceitos: .png, .jpg, .jpeg, .webp");
            }

            // Estimate base64 byte size
            int sizeInBytes = (base64OrUrl.length() * 3) / 4;
            if (sizeInBytes > 5 * 1024 * 1024) { // 5MB limit
                throw new IllegalArgumentException("A imagem excede o tamanho máximo de 5MB.");
            }
        }
    }
}
