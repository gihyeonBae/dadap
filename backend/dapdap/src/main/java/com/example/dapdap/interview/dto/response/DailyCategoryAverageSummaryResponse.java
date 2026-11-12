package com.example.dapdap.interview.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class DailyCategoryAverageSummaryResponse {
    private List<DailyAverageResponse> daily;
}
