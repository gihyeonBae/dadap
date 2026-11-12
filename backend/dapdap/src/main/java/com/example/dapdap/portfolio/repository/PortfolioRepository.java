package com.example.dapdap.portfolio.repository;

import com.example.dapdap.portfolio.entity.Portfolio;
import com.example.dapdap.portfolio.entity.PortfolioType; // Enum import
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {

    // 1. 전체 조회 (내꺼만조회)
    List<Portfolio> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    // 2. 타입별 조회 (필터링용)
    List<Portfolio> findAllByUserIdAndTypeOrderByCreatedAtDesc(Long userId, PortfolioType type);
}