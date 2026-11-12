package com.example.dapdap.auth.repository;

import com.example.dapdap.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByUser_Email(String email);
    void deleteByUser_Email(String email);
}
