package com.example.dapdap.interview.controller;

import com.example.dapdap.auth.domain.CustomUserDetails;
import com.example.dapdap.global.response.GlobalApiResponse;
import com.example.dapdap.interview.dto.response.InterviewListResponse;
import com.example.dapdap.interview.dto.response.InterviewResultResponse;
import com.example.dapdap.interview.dto.response.InterviewTurnsResponse;
import com.example.dapdap.interview.service.InterviewQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/interviews")
public class InterviewQueryController {

    private final InterviewQueryService interviewQueryService;

    @GetMapping
    public GlobalApiResponse<InterviewListResponse> getMyInterviews(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        return GlobalApiResponse.ok(interviewQueryService.getMyInterviews(userId));
    }

    @GetMapping("/{interviewId}/turns")
    public GlobalApiResponse<InterviewTurnsResponse> getTurns(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long interviewId
    ) {
        Long userId = userDetails.getUser().getId();
        return GlobalApiResponse.ok(interviewQueryService.getTurns(userId, interviewId));
    }

    @GetMapping("/{interviewId}/result")
    public GlobalApiResponse<InterviewResultResponse> getInterviewResult(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long interviewId
    ) {
        Long userId = userDetails.getUser().getId();
        return GlobalApiResponse.ok(interviewQueryService.getInterviewResult(userId, interviewId));
    }
}
