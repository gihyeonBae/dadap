package com.example.dapdap.interview.controller;

import com.example.dapdap.auth.domain.CustomUserDetails;
import com.example.dapdap.global.response.GlobalApiResponse;
import com.example.dapdap.interview.dto.response.ReportResponse;
import com.example.dapdap.interview.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/interviews")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/{interviewId}/report")
    public GlobalApiResponse<ReportResponse> getReport(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long interviewId
    ) {
        Long userId = userDetails.getUser().getId();
        return GlobalApiResponse.ok(reportService.getReport(userId, interviewId));
    }

    @PostMapping("/{interviewId}/report/generate")
    public GlobalApiResponse<ReportResponse> generate(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long interviewId
    ) {
        Long userId = userDetails.getUser().getId();
        return GlobalApiResponse.ok(
                "총괄 리포트를 생성했습니다.",
                reportService.generateReport(userId, interviewId)
        );
    }
}
