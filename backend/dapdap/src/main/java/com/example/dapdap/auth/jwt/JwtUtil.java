package com.example.dapdap.auth.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey secretKey;
    private final JwtProperties properties;

    public JwtUtil(JwtProperties properties) {
        this.properties = properties;

        if (properties.getSecret() == null || properties.getSecret().isBlank()) {
            throw new IllegalStateException("JWT secret is missing.");
        }

        this.secretKey = Keys.hmacShaKeyFor(
                properties.getSecret().getBytes(StandardCharsets.UTF_8)
        );
    }

    private Claims claims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getUsername(String token) {
        return claims(token).get("username", String.class);
    }

    public String getRole(String token) {
        return claims(token).get("role", String.class);
    }

    public String getCategory(String token) {
        return claims(token).get("category", String.class);
    }

    public void validateToken(String token) {
        // 여기서 서명/만료/형식 검증이 이루어짐. 문제 있으면 예외 발생
        claims(token);
    }

    public String createAccessToken(String username, String role) {
        return createJwt("access", username, role, properties.getAccessExpiration());
    }

    public String createRefreshToken(String username, String role) {
        return createJwt("refresh", username, role, properties.getRefreshExpiration());
    }

    private String createJwt(String category, String username, String role, long expiredMs) {
        long now = System.currentTimeMillis();

        return Jwts.builder()
                .claim("category", category)
                .claim("username", username)
                .claim("role", role)
                .issuedAt(new Date(now))
                .expiration(new Date(now + expiredMs))
                .signWith(secretKey)
                .compact();
    }
}
