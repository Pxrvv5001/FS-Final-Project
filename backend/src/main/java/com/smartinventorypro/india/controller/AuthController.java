package com.smartinventorypro.india.controller;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartinventorypro.india.model.Role;
import com.smartinventorypro.india.security.JwtService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Pattern STRONG_PASSWORD = Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,}$");

    @Value("${app.auth.admin-username:admin@inventory.com}")
    private String adminUsername;
    @Value("${app.auth.admin-secret:Admin@1234}")
    private String adminSecret;
    @Value("${app.auth.user-username:user@inventory.com}")
    private String userUsername;
    @Value("${app.auth.user-secret:User@1234}")
    private String userSecret;
    @Value("${app.auth.legacy-admin-username:admin}")
    private String legacyAdminUsername;
    @Value("${app.auth.legacy-admin-secret:admin123}")
    private String legacyAdminSecret;
    @Value("${app.auth.legacy-user-username:user}")
    private String legacyUserUsername;
    @Value("${app.auth.legacy-user-secret:user123}")
    private String legacyUserSecret;

    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        String username = request.username();
        String password = request.password();

        boolean isSecureAdmin = matchesCredential(adminUsername, adminSecret, username, password);
        boolean isSecureUser = matchesCredential(userUsername, userSecret, username, password);
        boolean isLegacyAdmin = matchesCredential(legacyAdminUsername, legacyAdminSecret, username, password);
        boolean isLegacyUser = matchesCredential(legacyUserUsername, legacyUserSecret, username, password);

        if ((isSecureAdmin || isSecureUser) && !STRONG_PASSWORD.matcher(password).matches()) {
            return ResponseEntity.badRequest().body(new HashMap<>(Map.of(
                    "message", "Use a strong password to protect your account"
            )));
        }

        if (isSecureAdmin || isLegacyAdmin) {
            return ResponseEntity.ok(buildAuthResponse("Admin User", username, Role.ADMIN));
        }
        if (isSecureUser || isLegacyUser) {
            return ResponseEntity.ok(buildAuthResponse("Standard User", username, Role.USER));
        }
        return ResponseEntity.status(401).body(new HashMap<>(Map.of("message", "Invalid credentials")));
    }

    private boolean matchesCredential(String configuredUsername, String configuredSecret, String inputUsername, String inputSecret) {
        return configuredUsername.equalsIgnoreCase(inputUsername) && configuredSecret.equals(inputSecret);
    }

    private Map<String, Object> buildAuthResponse(String name, String username, Role role) {
        String token = jwtService.generateToken(username, name, role);
        Instant expiresAt = jwtService.extractExpiration(token).toInstant();

        Map<String, Object> user = new HashMap<>();
        user.put("name", name);
        user.put("username", username);
        user.put("role", role);

        Map<String, Object> payload = new HashMap<>();
        payload.put("token", token);
        payload.put("tokenType", "Bearer");
        payload.put("expiresAt", expiresAt.toString());
        payload.put("user", user);
        return payload;
    }

    public record LoginRequest(
            @NotBlank(message = "Email is required") String username,
            @NotBlank(message = "Password is required") String password
    ) {
    }
}
