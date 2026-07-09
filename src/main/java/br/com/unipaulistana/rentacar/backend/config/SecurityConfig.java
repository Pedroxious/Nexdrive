package br.com.unipaulistana.rentacar.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
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

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @org.springframework.beans.factory.annotation.Value("${application.security.cors.allowed-origins:http://localhost:4200}")
    private String allowedOrigins;

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;
    private final OAuth2AuthenticationSuccessHandler oAuth2SuccessHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .headers(headers -> headers
                        .frameOptions(frame -> frame.deny())
                        .httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .maxAgeInSeconds(31536000)
                                .preload(true))
                        .referrerPolicy(referrer -> referrer
                                .policy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER))
                )
                .authorizeHttpRequests(auth -> auth
                        // Static resources (Angular build output)
                        .requestMatchers("/", "/index.html", "/favicon.ico").permitAll()
                        .requestMatchers("/*.js", "/*.css", "/*.woff2", "/*.woff", "/*.ttf", "/*.svg", "/*.png", "/*.jpg", "/*.ico").permitAll()
                        .requestMatchers("/assets/**", "/media/**", "/favicon/**").permitAll()
                        // SPA client-side routes (forwarded to index.html by SpaController)
                        .requestMatchers(
                                "/buy", "/rent", "/rent/**", "/car/**",
                                "/favorites", "/my-rentals", "/profile", "/sell-car",
                                "/about", "/faq", "/contact", "/privacy", "/terms",
                                "/login", "/register", "/404"
                        ).permitAll()
                        // Public API endpoints
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/logout",
                                "/api/vehicles",
                                "/api/vehicles/**",
                                "/api/reviews/vehicle/**"
                        ).permitAll()
                        // Swagger / OpenAPI documentation
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                        // Admin-only endpoints
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/rentals").hasRole("ADMIN")
                        // All other API requests require authentication
                        .anyRequest().authenticated())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/login")
                        .successHandler(oAuth2SuccessHandler)
                        .failureHandler((request, response, exception) -> {
                            String errorMessage = exception != null ? exception.getMessage() : "unknown";
                            response.sendRedirect("/login?error=" + java.net.URLEncoder.encode(errorMessage, java.nio.charset.StandardCharsets.UTF_8));
                        })
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
