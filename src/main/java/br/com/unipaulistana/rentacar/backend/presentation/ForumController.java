package br.com.unipaulistana.rentacar.backend.presentation;

import br.com.unipaulistana.rentacar.backend.domain.User;
import br.com.unipaulistana.rentacar.backend.dto.*;
import br.com.unipaulistana.rentacar.backend.repository.UserRepository;
import br.com.unipaulistana.rentacar.backend.service.ForumService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
public class ForumController {

    private final ForumService forumService;
    private final UserRepository userRepository;

    private User getOptionalCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return userRepository.findByEmail(auth.getName()).orElse(null);
        }
        return null;
    }

    private User getRequiredCurrentUser() {
        User user = getOptionalCurrentUser();
        if (user == null) {
            throw new org.springframework.security.access.AccessDeniedException("Autenticação necessária.");
        }
        return user;
    }

    @GetMapping("/topics")
    public ResponseEntity<ForumPageResponseDto> getTopics(
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "recent") String sort,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {
        return ResponseEntity.ok(forumService.getTopics(category, sort, search, page, size, getOptionalCurrentUser()));
    }

    @GetMapping("/topics/{id}")
    public ResponseEntity<ForumTopicResponseDto> getTopicById(@PathVariable Long id) {
        return ResponseEntity.ok(forumService.getTopicById(id, getOptionalCurrentUser()));
    }

    @GetMapping("/topics/{id}/comments")
    public ResponseEntity<List<ForumCommentDto>> getTopicComments(@PathVariable Long id) {
        return ResponseEntity.ok(forumService.getTopicComments(id));
    }

    @PostMapping("/topics")
    public ResponseEntity<ForumTopicResponseDto> createTopic(@RequestBody CreateTopicRequestDto dto) {
        return ResponseEntity.ok(forumService.createTopic(getRequiredCurrentUser(), dto));
    }

    @PostMapping("/topics/{id}/like")
    public ResponseEntity<ForumTopicResponseDto> toggleLike(@PathVariable Long id) {
        return ResponseEntity.ok(forumService.toggleLike(id, getRequiredCurrentUser()));
    }

    @PostMapping("/topics/{id}/comments")
    public ResponseEntity<ForumCommentDto> addComment(@PathVariable Long id, @RequestBody CreateCommentRequestDto dto) {
        return ResponseEntity.ok(forumService.addComment(id, getRequiredCurrentUser(), dto));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryStatsDto>> getCategories() {
        return ResponseEntity.ok(forumService.getCategoryStats());
    }

    @GetMapping("/featured-member")
    public ResponseEntity<FeaturedMemberDto> getFeaturedMember() {
        return ResponseEntity.ok(forumService.getFeaturedMember());
    }

    @GetMapping("/stats")
    public ResponseEntity<ForumStatsDto> getStats() {
        return ResponseEntity.ok(forumService.getForumStats());
    }
}
