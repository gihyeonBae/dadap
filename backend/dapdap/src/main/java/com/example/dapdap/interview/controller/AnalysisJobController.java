package com.example.dapdap.interview.controller;

import com.example.dapdap.global.response.GlobalApiResponse;
import com.example.dapdap.interview.dto.response.AnalysisJobStatusResponse;
import com.example.dapdap.interview.service.AnalysisJobQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/analysis-jobs")
public class AnalysisJobController {

    private final AnalysisJobQueryService jobQueryService;

    @GetMapping("/{jobId}")
    public GlobalApiResponse<AnalysisJobStatusResponse> getJob(@PathVariable Long jobId) {
        return GlobalApiResponse.ok(jobQueryService.getJobStatus(jobId));
    }
}
