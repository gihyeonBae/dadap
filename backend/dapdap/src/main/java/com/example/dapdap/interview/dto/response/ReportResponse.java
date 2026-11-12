package com.example.dapdap.interview.dto.response;

import com.example.dapdap.interview.entity.ReportStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ReportResponse {

    private Long interviewId;
    private ReportStatus status;

    private int totalScore;
    private String totalFeedback;
    private String summaryJson;

    private String fullVideoKey;
    private String fullAudioKey;
}
