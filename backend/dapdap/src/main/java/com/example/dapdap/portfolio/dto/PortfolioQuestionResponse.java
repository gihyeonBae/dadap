package com.example.dapdap.portfolio.dto;

import com.example.dapdap.portfolio.entity.PortfolioQuestion;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class PortfolioQuestionResponse {
    private Long id;
    private String content;
    private String intent;
    private String topic;
    private int depth;
    private List<PortfolioQuestionResponse> children;

    // 엔티티 -> DTO 변환 (재귀적)
    public static PortfolioQuestionResponse from(PortfolioQuestion entity) {
        return PortfolioQuestionResponse.builder()
                .id(entity.getId())
                .content(entity.getContent())
                .intent(entity.getIntent())
                .topic(entity.getTopic())
                .depth(entity.getDepth())
                .children(entity.getChildren().stream()
                        .map(PortfolioQuestionResponse::from)
                        .collect(Collectors.toList()))
                .build();
    }
}