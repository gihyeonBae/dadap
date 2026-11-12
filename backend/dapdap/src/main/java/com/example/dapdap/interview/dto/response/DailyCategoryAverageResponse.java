package com.example.dapdap.interview.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class DailyCategoryAverageResponse {
    private Long categoryId;
    private String categoryName;
    private List<SessionAverageResponse> sessions;
}

