package com.example.dapdap.users.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MyPageSummaryResponse {
    private Double averageSttScore;
    private long totalInterviewCount;
    private int currentStreakDays;
    private long scrapCount;
}
