package com.example.dapdap.interview.controller;

import com.example.dapdap.auth.domain.CustomUserDetails;
import com.example.dapdap.global.response.GlobalApiResponse;
import com.example.dapdap.interview.dto.response.AnalyzeTurnResponse;
import com.example.dapdap.interview.service.InterviewAudioAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/interviews")
public class InterviewAudioAnalysisController {

    private final InterviewAudioAnalysisService audioAnalysisService;

    @PostMapping("/{interviewId}/turns/{turnId}/analyze-audio")
    public GlobalApiResponse<AnalyzeTurnResponse> analyzeAudio(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long interviewId,
            @PathVariable Long turnId
    ) {
        Long userId = userDetails.getUser().getId();
        return GlobalApiResponse.ok(
                "오디오 분석이 완료되었습니다.",
                audioAnalysisService.analyzeAudioTurn(userId, interviewId, turnId)
        );
    }
}
