package br.com.unipaulistana.rentacar.backend.config;

import br.com.unipaulistana.rentacar.backend.repository.UserSessionRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT authentication filter.
 *
 * Security rules enforced here:
 * 1. Token is read from httpOnly cookie only (Bearer header fallback kept for Swagger/API tools).
 * 2. A valid JWT signature is NOT sufficient — the session must also be present and active in the DB.
 *    If no active session is found, the request proceeds UNAUTHENTICATED. No auto-creation of sessions.
 * 3. All exceptions during token validation are swallowed silently so public endpoints are unaffected.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final UserSessionRepository sessionRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        final String jwt = extractToken(request);

        if (jwt == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String userEmail = jwtService.extractUsername(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    // SECURITY: session must exist and be active in DB.
                    // If no active session is found — the token was revoked (logout/password change) — reject.
                    // We NEVER create a new session here for backward compatibility. That path is eliminated.
                    boolean hasActiveSession = sessionRepository.findByTokenAndActiveTrue(jwt).isPresent();

                    if (hasActiveSession) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities());
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                    // else: token is cryptographically valid but session was revoked — proceed unauthenticated
                }
            }
        } catch (Exception e) {
            // Malformed / expired token — proceed unauthenticated (public endpoints unaffected)
            logger.warn("JWT validation failed for request [" + request.getRequestURI() + "]: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Reads the JWT from:
     * 1. httpOnly cookie "token" (preferred, not readable by JS)
     * 2. Authorization: Bearer header (kept for Swagger UI / API tool compatibility)
     *
     * Cookie takes priority.
     */
    private String extractToken(HttpServletRequest request) {
        // 1. Cookie (preferred)
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("token".equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isBlank()) {
                    return cookie.getValue();
                }
            }
        }

        // 2. Bearer header (fallback for Swagger/Postman)
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (!token.isBlank()) {
                return token;
            }
        }

        return null;
    }
}
