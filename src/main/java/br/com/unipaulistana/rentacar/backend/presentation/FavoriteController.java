package br.com.unipaulistana.rentacar.backend.presentation;

import br.com.unipaulistana.rentacar.backend.domain.Favorite;
import br.com.unipaulistana.rentacar.backend.domain.User;
import br.com.unipaulistana.rentacar.backend.repository.UserRepository;
import br.com.unipaulistana.rentacar.backend.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService service;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    @PostMapping("/{vehicleId}")
    public ResponseEntity<Void> toggle(@PathVariable Long vehicleId) {
        service.toggleFavorite(getCurrentUser(), vehicleId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/my")
    public ResponseEntity<List<Favorite>> getMy() {
        return ResponseEntity.ok(service.getMyFavorites(getCurrentUser()));
    }

    @GetMapping("/check/{vehicleId}")
    public ResponseEntity<Map<String, Boolean>> check(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(Map.of("favorited", service.isFavorited(getCurrentUser(), vehicleId)));
    }
}
