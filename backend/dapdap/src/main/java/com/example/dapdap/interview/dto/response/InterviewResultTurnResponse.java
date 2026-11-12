package com.example.dapdap.interview.dto.response;

import com.example.dapdap.interview.entity.AnalysisStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class InterviewResultTurnResponse {
    private Long turnId;
    private int turnIndex;
    private boolean followUp;
    private Long parentTurnId;
    private Long questionId;
    private String questionText;
    private String answerText;
    private String feedbackText;
    private Integer sttScore;
    private Double charsPerMin;
    private AnalysisStatus analysisStatus;
    private String audioUrl;
    private String videoUrl;
    private java.util.List<AnalysisJobResultResponse> videoAnalyses;
}
