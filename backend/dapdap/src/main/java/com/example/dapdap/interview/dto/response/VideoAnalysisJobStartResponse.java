package com.example.dapdap.interview.dto.response;

public record VideoAnalysisJobStartResponse(
        Long interviewId,
        Long turnId,
        Long jobId,
        String status
) {}
