package com.example.dapdap.interview.service;

import com.example.dapdap.interview.dto.response.AnalysisJobStatusResponse;
import com.example.dapdap.interview.repository.AnalysisJobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AnalysisJobQueryService {

    private final AnalysisJobRepository jobRepository;

    public AnalysisJobStatusResponse getJobStatus(Long jobId) {
        var job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("job not found. id=" + jobId));

        return new AnalysisJobStatusResponse(
                job.getId(),
                job.getType().name(),
                job.getStatus().name(),
                job.getResultJson(),
                job.getScore(),
                job.getErrorMessage()
        );
    }
}
