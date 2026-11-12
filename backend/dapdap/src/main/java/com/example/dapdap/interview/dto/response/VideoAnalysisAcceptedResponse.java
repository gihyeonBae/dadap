package com.example.dapdap.interview.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class VideoAnalysisAcceptedResponse {
    private Long interviewId;
    private Long turnId;
    private Long jobId;
    private String status;
}
