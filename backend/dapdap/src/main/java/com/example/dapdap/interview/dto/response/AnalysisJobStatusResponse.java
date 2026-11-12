package com.example.dapdap.interview.dto.response;

public record AnalysisJobStatusResponse(
        Long jobId,
        String type,
        String status,
        String resultJson,   // DONE이면 내려줌(원치 않으면 제거 가능)
        Integer score,
        String errorMessage
) {}
