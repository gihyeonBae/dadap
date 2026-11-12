package com.example.dapdap.interview.controller;


import com.example.dapdap.auth.domain.CustomUserDetails;
import com.example.dapdap.global.response.GlobalApiResponse;
import com.example.dapdap.interview.dto.request.InterviewCreateRequest;
import com.example.dapdap.interview.dto.request.InterviewTitleUpdateRequest;
import com.example.dapdap.interview.dto.response.InterviewCreateResponse;
import com.example.dapdap.interview.dto.response.NextQuestionResponse;
import com.example.dapdap.interview.dto.response.InterviewTitleResponse;
import com.example.dapdap.interview.service.InterviewService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/interviews")
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping
    public GlobalApiResponse<InterviewCreateResponse> create(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody InterviewCreateRequest req
    ) {
        Long userId = userDetails.getUser().getId();
        return GlobalApiResponse.created("면접이 생성되었습니다.", interviewService.createInterview(userId, req));
    }

    @PostMapping("/{interviewId}/next-question")
    public GlobalApiResponse<NextQuestionResponse> nextQuestion(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long interviewId
    ) {
        Long userId = userDetails.getUser().getId();
        return GlobalApiResponse.ok(interviewService.nextQuestion(userId, interviewId));
    }

    @PatchMapping("/{interviewId}/title")
    public GlobalApiResponse<InterviewTitleResponse> updateTitle(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long interviewId,
            @Valid @RequestBody InterviewTitleUpdateRequest request
    ) {
        Long userId = userDetails.getUser().getId();
        return GlobalApiResponse.ok(interviewService.updateTitle(userId, interviewId, request.getTitle()));
    }

    @DeleteMapping("/{interviewId}")
    public GlobalApiResponse<Void> deleteInterview(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long interviewId
    ) {
        Long userId = userDetails.getUser().getId();
        interviewService.deleteInterview(userId, interviewId);
        return GlobalApiResponse.noContent("면접이 삭제되었습니다.");
    }
}
