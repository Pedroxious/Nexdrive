package br.com.unipaulistana.rentacar.backend.service;

import br.com.unipaulistana.rentacar.backend.domain.*;
import br.com.unipaulistana.rentacar.backend.dto.*;
import br.com.unipaulistana.rentacar.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ForumService {

    private final ForumTopicRepository topicRepository;
    private final ForumCommentRepository commentRepository;
    private final ForumLikeRepository likeRepository;
    private final ForumBotRepository botRepository;

    private static final List<String> CATEGORIES = List.of(
            "Suporte", "Duvidas sobre Veiculos", "Experiencias com Locadoras", "Dicas e Mecanica", "Off-Topic", "Anuncios"
    );

    @Transactional(readOnly = true)
    public ForumPageResponseDto getTopics(String category, String sort, String search, int page, int size, User currentUser) {
        String filterCat = (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) ? category : null;
        String keyword = (search != null && !search.isBlank()) ? search.trim() : null;

        List<ForumTopic> allTopics;
        if (keyword != null) {
            if (filterCat != null) {
                allTopics = topicRepository.searchByTitleAndCategory(keyword, filterCat, Pageable.unpaged()).getContent();
            } else {
                allTopics = topicRepository.searchByTitle(keyword, Pageable.unpaged()).getContent();
            }
        } else {
            if (filterCat != null) {
                allTopics = topicRepository.findByCategory(filterCat, Pageable.unpaged()).getContent();
            } else {
                allTopics = topicRepository.findAll();
            }
        }

        if ("popular".equalsIgnoreCase(sort)) {
            allTopics.sort((t1, t2) -> {
                double score1 = calculatePopularityScore(t1);
                double score2 = calculatePopularityScore(t2);
                return Double.compare(score2, score1);
            });
        } else {
            allTopics.sort((t1, t2) -> {
                if (t1.isPinned() && !t2.isPinned()) return -1;
                if (!t1.isPinned() && t2.isPinned()) return 1;
                return t2.getUpdatedAt().compareTo(t1.getUpdatedAt());
            });
        }

        int totalElements = allTopics.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        int fromIndex = Math.min(page * size, totalElements);
        int toIndex = Math.min(fromIndex + size, totalElements);

        List<ForumTopic> pagedTopics = allTopics.subList(fromIndex, toIndex);

        List<ForumTopicResponseDto> content = pagedTopics.stream()
                .map(topic -> mapToTopicDto(topic, currentUser))
                .toList();

        return new ForumPageResponseDto(content, totalPages, totalElements, page, size);
    }

    private double calculatePopularityScore(ForumTopic topic) {
        long hours = ChronoUnit.HOURS.between(topic.getCreatedAt(), LocalDateTime.now());
        if (hours < 0) hours = 0;
        return (topic.getLikesCount() * 3 + topic.getRepliesCount() * 2 + topic.getViewsCount() * 0.1) / (hours / 24.0 + 1);
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
                .participantsCount(1)
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
        
        long pCount = commentRepository.findByTopicOrderByCreatedAtAsc(topic).stream()
            .map(c -> c.getAuthorUser() != null ? c.getAuthorUser().getId() + "_u" : c.getAuthorBot().getId() + "_b")
            .distinct().count();
            
        Set<String> parts = new HashSet<>();
        parts.add(topic.getAuthorUser() != null ? topic.getAuthorUser().getId() + "_u" : topic.getAuthorBot().getId() + "_b");
        topic.setParticipantsCount((int) (pCount == 0 ? 1 : pCount + 1));
        
        topicRepository.save(topic);

        return mapToCommentDto(saved);
    }

    @Transactional(readOnly = true)
    public List<CategoryStatsDto> getCategoryStats() {
        String[] colors = {"#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#6B7280"};
        List<CategoryStatsDto> stats = new ArrayList<>();
        int i = 0;
        for (String cat : CATEGORIES) {
            long count = topicRepository.countByCategory(cat);
            stats.add(new CategoryStatsDto(cat, count, colors[i % colors.length]));
            i++;
        }
        return stats;
    }

    @Transactional(readOnly = true)
    public FeaturedMemberDto getFeaturedMember() {
        List<ForumBot> bots = botRepository.findAll();
        if (bots.isEmpty()) return null;
        
        bots.sort((b1, b2) -> Integer.compare(b2.getPostCount() + b2.getCommentCount(), b1.getPostCount() + b1.getCommentCount()));
        ForumBot top = bots.get(0);
        return new FeaturedMemberDto(top.getId(), top.getName(), top.getAvatarUrl(), top.getRoleTag(), top.getPostCount(), top.getCommentCount());
    }

    @Transactional(readOnly = true)
    public ForumStatsDto getForumStats() {
        long topics = topicRepository.count();
        long comments = commentRepository.count();
        long members = botRepository.count(); // + userRepository.count() ? Just botRepository is fine as requested.
        return new ForumStatsDto(topics, comments, members);
    }

    private ForumTopicResponseDto mapToTopicDto(ForumTopic topic, User currentUser) {
        AuthorDto author = mapAuthor(topic.getAuthorUser(), topic.getAuthorBot());
        List<AuthorDto> participantAvatars = getParticipantAvatars(topic);

        boolean userLiked = false;
        if (currentUser != null) {
            userLiked = likeRepository.existsByTopicAndUser(topic, currentUser);
        }

        String lastActivityAuthor = author.name();
        List<ForumComment> comments = commentRepository.findByTopicOrderByCreatedAtDesc(topic, PageRequest.of(0, 1));
        if (!comments.isEmpty()) {
            ForumComment lastComm = comments.get(0);
            AuthorDto lastAuth = mapAuthor(lastComm.getAuthorUser(), lastComm.getAuthorBot());
            lastActivityAuthor = lastAuth.name();
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
                topic.getParticipantsCount(),
                topic.getImageUrl(),
                topic.getCreatedAt(),
                topic.getUpdatedAt(),
                participantAvatars,
                lastActivityAuthor,
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
        return new AuthorDto(0L, "Usuario Anonimo", "https://ui-avatars.com/api/?name=Anonimo", null, false);
    }

    private List<AuthorDto> getParticipantAvatars(ForumTopic topic) {
        List<ForumComment> comments = commentRepository.findByTopicOrderByCreatedAtAsc(topic);
        Set<String> seenKey = new HashSet<>();
        List<AuthorDto> avatars = new ArrayList<>();

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
                throw new IllegalArgumentException("Formato de imagem invalido. Formatos aceitos: .png, .jpg, .jpeg, .webp");
            }

            int sizeInBytes = (base64OrUrl.length() * 3) / 4;
            if (sizeInBytes > 5 * 1024 * 1024) { 
                throw new IllegalArgumentException("A imagem excede o tamanho maximo de 5MB.");
            }
        }
    }
}
