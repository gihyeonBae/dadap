package com.example.dapdap.interview.controller;

import com.example.dapdap.auth.domain.CustomUserDetails;
import com.example.dapdap.interview.dto.response.DailyCategoryAverageSummaryResponse;
import com.example.dapdap.interview.service.StudyLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/interviews/")
public class InterviewStudyLogController {
    private final StudyLogService studyLogService;
    @GetMapping("/me/daily-category-averages")
    public DailyCategoryAverageSummaryResponse getDailyCategoryAverages(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam String date
    ) {
        long userId = userDetails.getUser().getId();
        return studyLogService.getDailyCategoryAverages(userId, LocalDate.parse(date));
    }

}
