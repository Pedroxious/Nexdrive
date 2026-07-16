package br.com.unipaulistana.rentacar.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity           // enables @PreAuthorize on controller methods
@RequiredArgsConstructor
public class SecurityConfig {

    @Value("${application.security.cors.allowed-origins:http://localhost:4200}")
    private String allowedOrigins;

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;
    private final OAuth2AuthenticationSuccessHandler oAuth2SuccessHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // V-07: CSRF is disabled because we use SameSite=Lax cookies with a stateless JWT design.
                // The canonical auth mechanism is cookie-only (httpOnly); Bearer is kept for API tools only.
                // If Bearer is fully removed in the future, re-enable CSRF with Double Submit Cookie pattern.
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .headers(headers -> headers
                        .frameOptions(frame -> frame.deny())
                        .httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .maxAgeInSeconds(31536000)
                                .preload(true))
                        .referrerPolicy(referrer -> referrer
                                .policy(org.springframework.security.web.header.writers
                                        .ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER))
                        // Security: prevent MIME-type sniffing
                        .contentTypeOptions(c -> {})
                )
                // Redirect already-authenticated users away from OAuth2 initiation
                .addFilterBefore(new org.springframework.web.filter.OncePerRequestFilter() {
                    @Override
                    protected void doFilterInternal(
                            jakarta.servlet.http.HttpServletRequest request,
                            jakarta.servlet.http.HttpServletResponse response,
                            jakarta.servlet.FilterChain filterChain) throws jakarta.servlet.ServletException, java.io.IOException {
                        String uri = request.getRequestURI();
                        if (uri.startsWith("/oauth2/authorization/")) {
                            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                            if (auth != null && auth.isAuthenticated()
                                    && !(auth instanceof org.springframework.security.authentication.AnonymousAuthenticationToken)) {
                                response.sendRedirect("/");
                                return;
                            }
                        } else if (uri.equals("/oauth2-login")) {
                            response.sendRedirect("/login");
                            return;
                        }
                        filterChain.doFilter(request, response);
                    }
                }, org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter.class)
                .authorizeHttpRequests(auth -> auth
                        // Static resources (Angular build output)
                        .requestMatchers("/", "/index.html", "/favicon.ico").permitAll()
                        .requestMatchers("/*.js", "/*.css", "/*.woff2", "/*.woff", "/*.ttf",
                                "/*.svg", "/*.png", "/*.jpg", "/*.ico").permitAll()
                        .requestMatchers("/assets/**", "/media/**", "/favicon/**").permitAll()
                        // SPA client-side routes (forwarded to index.html by SpaController)
                        .requestMatchers(
                                "/buy", "/rent", "/rent/**", "/car/**",
                                "/favorites", "/my-rentals", "/profile", "/sell-car",
                                "/about", "/faq", "/contact", "/privacy", "/terms",
                                "/login", "/register", "/404", "/oauth2-login"
                        ).permitAll()
                        // Swagger / OpenAPI (consider restricting in production)
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                        // Public auth endpoints
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/logout",
                                "/api/auth/refresh",        // V-04: refresh is public — access token is expired when called
                                "/api/reviews/vehicle/**"   // Reading reviews is public
                        ).permitAll()
                        // V-22 fix: vehicle CATALOG is public, but READ-ONLY (GET only).
                        // This rule is declared with an explicit method constraint so it does NOT
                        // shadow the ADMIN rules for POST/PUT/DELETE below.
                        // Rule evaluation order: Spring Security uses first-match. By putting the
                        // method-specific GET rule here and the ADMIN write rules after, we guarantee:
                        //   GET  /api/vehicles    → permitAll  (catalog listing/search, public)
                        //   POST /api/vehicles    → hasRole(ADMIN)  (create vehicle)
                        //   PUT  /api/vehicles/** → hasRole(ADMIN)  (update vehicle)
                        //   DELETE /api/vehicles/** → hasRole(ADMIN) (delete vehicle)
                        .requestMatchers(HttpMethod.GET, "/api/vehicles", "/api/vehicles/**").permitAll()
                        // V-02 fix: Admin-only endpoints — declared AFTER the public GET rule above
                        // so the more-specific method+path combination is reached correctly.
                        .requestMatchers(HttpMethod.GET, "/api/rentals").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/users").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/vehicles").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/vehicles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/vehicles/**").hasRole("ADMIN")
                        // All other API requests require authentication
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exceptions -> exceptions
                        .defaultAuthenticationEntryPointFor(
                                new org.springframework.security.web.authentication.HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                                request -> request.getRequestURI().startsWith("/api/")
                        )
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/oauth2-login")
                        .successHandler(oAuth2SuccessHandler)
                        // V-08 fix: never reflect raw exception messages in redirects.
                        // Map to generic error codes that the frontend handles safely.
                        .failureHandler((request, response, exception) -> {
                            String safeCode = mapOAuth2ErrorToCode(exception);
                            response.sendRedirect("/login?error=" + safeCode);
                        })
                );

        return http.build();
    }

    /**
     * V-08 fix: maps OAuth2 exceptions to generic, safe error codes.
     * The full exception (with stack trace) is logged server-side by Spring Security.
     * The client only receives a short, whitelisted code — never the raw exception message.
     */
    private String mapOAuth2ErrorToCode(Exception exception) {
        if (exception == null) return "auth_failed";
        String msg = exception.getMessage();
        if (msg == null) return "auth_failed";
        msg = msg.toLowerCase();
        if (msg.contains("email")) return "no_email";
        if (msg.contains("access_denied") || msg.contains("access denied")) return "access_denied";
        if (msg.contains("invalid_token") || msg.contains("invalid token")) return "invalid_token";
        // Anything else → generic code (no internal detail leaked)
        return "auth_failed";
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        // Safety guard: wildcard '*' must never be used when allowCredentials is true.
        // Spring itself would throw an exception, but we guard explicitly.
        if (origins.stream().anyMatch("*"::equals)) {
            throw new IllegalStateException(
                    "CORS allowedOrigins must not contain wildcard '*' when allowCredentials is true. " +
                    "Set ALLOWED_ORIGINS environment variable to specific origins.");
        }

        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
