package com.smartinventorypro.india.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.smartinventorypro.india.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_USER = "USER";
    private static final String PRODUCTS_API = "/api/products/**";
    private static final String CATEGORIES_API = "/api/categories/**";

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/login", "/api/health/**", "/h2-console/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/dashboard/**", PRODUCTS_API, "/api/stock/history", "/api/stock/invoice/**").hasAnyRole(ROLE_ADMIN, ROLE_USER)
                    .requestMatchers(HttpMethod.GET, CATEGORIES_API).hasAnyRole(ROLE_ADMIN, ROLE_USER)
                    .requestMatchers(HttpMethod.POST, "/api/stock/entry").hasAnyRole(ROLE_ADMIN, ROLE_USER)
                    .requestMatchers("/api/suppliers/**").hasRole(ROLE_ADMIN)
                    .requestMatchers(HttpMethod.POST, PRODUCTS_API).hasRole(ROLE_ADMIN)
                    .requestMatchers(HttpMethod.PUT, PRODUCTS_API).hasRole(ROLE_ADMIN)
                    .requestMatchers(HttpMethod.DELETE, PRODUCTS_API).hasRole(ROLE_ADMIN)
                    .requestMatchers(HttpMethod.POST, CATEGORIES_API).hasRole(ROLE_ADMIN)
                    .requestMatchers(HttpMethod.PUT, CATEGORIES_API).hasRole(ROLE_ADMIN)
                    .requestMatchers(HttpMethod.DELETE, CATEGORIES_API).hasRole(ROLE_ADMIN)
                        .anyRequest().authenticated()
                )
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
