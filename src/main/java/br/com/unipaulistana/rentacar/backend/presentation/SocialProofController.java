package br.com.unipaulistana.rentacar.backend.presentation;

import br.com.unipaulistana.rentacar.backend.domain.User;
import br.com.unipaulistana.rentacar.backend.dto.VehicleSocialProofDto;
import br.com.unipaulistana.rentacar.backend.repository.UserRepository;
import br.com.unipaulistana.rentacar.backend.service.SocialProofService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class SocialProofController {

    private final SocialProofService socialProofService;
    private final UserRepository userRepository;

    private User getOptionalCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return userRepository.findByEmail(auth.getName()).orElse(null);
        }
        return null;
    }

    @GetMapping("/{id}/social-proof")
    public ResponseEntity<VehicleSocialProofDto> getSocialProof(@PathVariable Long id) {
        return ResponseEntity.ok(socialProofService.getSocialProof(id));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<Void> recordView(@PathVariable Long id) {
        User currentUser = getOptionalCurrentUser();
        if (currentUser != null) {
            socialProofService.recordView(currentUser, id);
        }
        return ResponseEntity.ok().build();
    }
}
