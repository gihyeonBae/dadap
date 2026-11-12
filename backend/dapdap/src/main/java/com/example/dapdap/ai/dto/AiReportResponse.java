package com.example.dapdap.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiReportResponse {
    private int totalScore;
    private String totalFeedback;
    private String summaryJson; // JSON string
}
