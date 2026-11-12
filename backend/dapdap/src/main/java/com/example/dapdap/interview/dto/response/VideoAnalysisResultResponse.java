package com.example.dapdap.interview.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class VideoAnalysisResultResponse {
    private String status;
    private Integer totalScore;
    private String feedbackTitle;
    private List<String> detailedFeedback;
    private String coachingMessage;
}
