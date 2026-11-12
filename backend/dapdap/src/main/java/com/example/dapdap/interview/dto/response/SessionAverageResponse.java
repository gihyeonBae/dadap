package com.example.dapdap.interview.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SessionAverageResponse {
    private Long interviewId;
    private int avgScore;
    private long turnCount;
}
