package com.example.dapdap.portfolio.dto;

import com.example.dapdap.portfolio.entity.Portfolio;
import com.example.dapdap.portfolio.entity.PortfolioType; // Enum import
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PortfolioResponse {
    private Long id;
    private String title;
    private PortfolioType type; // 문서 타입 추가
    private String originalFilename;
    private String fileUrl;
    private LocalDateTime createdAt;

    public static PortfolioResponse from(Portfolio entity) {
        return PortfolioResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .type(entity.getType()) // Entity에서 가져옴
                .originalFilename(entity.getOriginalFilename())
                .fileUrl(entity.getFileUrl())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}