package br.com.unipaulistana.rentacar.backend.config;

import br.com.unipaulistana.rentacar.backend.domain.User;
import br.com.unipaulistana.rentacar.backend.domain.UserSession;
import br.com.unipaulistana.rentacar.backend.repository.UserRepository;
import br.com.unipaulistana.rentacar.backend.repository.UserSessionRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
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

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final UserSessionRepository sessionRepository;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        String jwt = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
        } else {
            jakarta.servlet.http.Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (jakarta.servlet.http.Cookie cookie : cookies) {
                    if ("token".equals(cookie.getName())) {
                        jwt = cookie.getValue();
                        break;
                    }
                }
            }
        }

        if (jwt == null) {
            filterChain.doFilter(request, response);
            return;
        }

        final String finalJwt = jwt;
        try {
            final String userEmail = jwtService.extractUsername(finalJwt);
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                if (jwtService.isTokenValid(finalJwt, userDetails)) {
                    // Check if session is active or create one for backward compatibility
                    UserSession session = sessionRepository.findByTokenAndActiveTrue(finalJwt)
                            .orElseGet(() -> {
                                User user = userRepository.findByEmail(userEmail).orElse(null);
                                if (user != null) {
                                    UserSession newSession = UserSession.builder()
                                            .user(user)
                                            .token(finalJwt)
                                            .device(getDeviceFromUserAgent(request.getHeader("User-Agent")))
                                            .createdAt(java.time.LocalDateTime.now())
                                            .active(true)
                                            .build();
                                    return sessionRepository.save(newSession);
                                }
                                return null;
                            });

                    if (session != null && session.isActive()) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities());
                        authToken.setDetails(
                                new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            }
        } catch (Exception e) {
            // Keep going for public endpoints even if token is malformed
            logger.warn("JWT validation failed: " + e.getMessage());
        }
        filterChain.doFilter(request, response);
    }

    private String getDeviceFromUserAgent(String userAgent) {
        if (userAgent == null || userAgent.isEmpty()) {
            return "Dispositivo desconhecido";
        }
        String ua = userAgent.toLowerCase();
        String browser = "Navegador Desconhecido";
        if (ua.contains("chrome") && !ua.contains("edg") && !ua.contains("opr")) {
            browser = "Chrome";
        } else if (ua.contains("firefox")) {
            browser = "Firefox";
        } else if (ua.contains("safari") && !ua.contains("chrome")) {
            browser = "Safari";
        } else if (ua.contains("edg")) {
            browser = "Edge";
        } else if (ua.contains("opr") || ua.contains("opera")) {
            browser = "Opera";
        }

        String os = "Sistema Desconhecido";
        if (ua.contains("windows")) {
            os = "Windows";
        } else if (ua.contains("mac")) {
            os = "macOS";
        } else if (ua.contains("linux")) {
            os = "Linux";
        } else if (ua.contains("android")) {
            os = "Android";
        } else if (ua.contains("iphone") || ua.contains("ipad")) {
            os = "iOS";
        }

        return browser + " no " + os;
    }
}
