package com.example.dapdap.interview.dto.response;

import com.example.dapdap.interview.entity.AnalysisJobStatus;
import com.example.dapdap.interview.entity.VideoEmotionScore;
import com.example.dapdap.interview.entity.VideoAnalysisSummary;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class AnalysisJobResultResponse {
    private Long jobId;
    private AnalysisJobStatus status;
    private Integer score;
    private VideoAnalysisSummary inputSummary;
    private List<VideoEmotionScore> inputEmotions;
    private String feedbackTitle;
    private List<String> detailedFeedback;
    private String coachingMessage;
    private String errorMessage;
}
