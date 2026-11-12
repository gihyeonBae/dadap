package com.example.dapdap.interview.controller;

import com.example.dapdap.auth.domain.CustomUserDetails;
import com.example.dapdap.global.response.GlobalApiResponse;
import com.example.dapdap.interview.dto.response.VideoAnalysisAcceptedResponse;
import com.example.dapdap.interview.dto.response.VideoAnalysisJobStartResponse;
import com.example.dapdap.interview.dto.response.VideoAnalysisResultResponse;
import com.example.dapdap.interview.service.InterviewVideoAnalysisService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/interviews")
public class InterviewVideoAnalysisController {

    private final InterviewVideoAnalysisService videoAnalysisService;

    @PostMapping("/{interviewId}/turns/{turnId}/analyze-video")
    public GlobalApiResponse<VideoAnalysisJobStartResponse> analyzeVideo(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long interviewId,
            @PathVariable Long turnId
    ) {
        Long userId = userDetails.getUser().getId();
        return GlobalApiResponse.ok(
                "비디오 분석 작업이 시작되었습니다.",
                videoAnalysisService.startVideoAnalysis(userId, interviewId, turnId)
        );
    }

    @PostMapping("/{interviewId}/turns/{turnId}/video-analysis")
    public GlobalApiResponse<VideoAnalysisAcceptedResponse> submitVideoAnalysis(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long interviewId,
            @PathVariable Long turnId,
            @RequestBody JsonNode payload
    ) {
        Long userId = userDetails.getUser().getId();
        return GlobalApiResponse.of(
                HttpStatus.ACCEPTED,
                "VIDEO_ANALYSIS_ACCEPTED",
                videoAnalysisService.submitVideoAnalysis(userId, interviewId, turnId, payload)
        );
    }

    @GetMapping("/{interviewId}/turns/{turnId}/video-analysis")
    public GlobalApiResponse<VideoAnalysisResultResponse> getVideoAnalysis(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long interviewId,
            @PathVariable Long turnId
    ) {
        Long userId = userDetails.getUser().getId();
        return GlobalApiResponse.ok(
                videoAnalysisService.getVideoAnalysis(userId, interviewId, turnId)
        );
    }
}
