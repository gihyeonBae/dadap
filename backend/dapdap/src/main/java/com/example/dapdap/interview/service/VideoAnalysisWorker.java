package com.example.dapdap.interview.service;

import com.example.dapdap.ai.config.AiProperties;
import com.example.dapdap.interview.entity.AnalysisJob;
import com.example.dapdap.interview.repository.AnalysisJobRepository;
import com.example.dapdap.interview.repository.InterviewRepository;
import com.example.dapdap.interview.repository.InterviewTurnRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Objects;

@Slf4j
@Component
@RequiredArgsConstructor
public class VideoAnalysisWorker {

    private final AnalysisJobRepository jobRepository;
    private final InterviewRepository interviewRepository;
    private final InterviewTurnRepository turnRepository;
    private final WebClient aiWebClient;
    private final AiProperties aiProperties;
    private final ObjectMapper objectMapper;

    @Async("analysisTaskExecutor")
    @Transactional
    public void runVideoAnalysisAsync(Long jobId, Long userId) {
        AnalysisJob job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("job not found. id=" + jobId));

        job.markRunning();

        try {
            // 권한/존재 확인
            interviewRepository.findByIdAndUser_IdAndDeletedAtIsNull(job.getInterview().getId(), userId)
                    .orElseThrow(() -> new IllegalArgumentException("면접을 찾을 수 없습니다. interviewId=" + job.getInterview().getId()));

            var turn = turnRepository.findByIdAndInterview_Id(job.getTurnId(), job.getInterview().getId())
                    .orElseThrow(() -> new IllegalArgumentException("턴을 찾을 수 없습니다. turnId=" + job.getTurnId()));

            if (job.getInputJson() == null || job.getInputJson().isBlank()) {
                throw new IllegalArgumentException("video analysis input json is missing.");
            }

            JsonNode payload = objectMapper.readTree(job.getInputJson());

            String path = Objects.requireNonNullElse(aiProperties.getAnalyzeVideoPath(), aiProperties.getAnalyzePath());

            JsonNode aiRes = aiWebClient.post()
                    .uri(path)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            if (aiRes == null) {
                throw new IllegalStateException("AI video response is empty.");
            }

            Integer totalScore = aiRes.hasNonNull("total_score") ? aiRes.get("total_score").asInt() : null;
            String feedbackTitle = aiRes.hasNonNull("feedback_title") ? aiRes.get("feedback_title").asText() : null;
            String coachingMessage = aiRes.hasNonNull("coaching_message") ? aiRes.get("coaching_message").asText() : null;
            @SuppressWarnings("unchecked")
            java.util.List<String> detailedFeedback = aiRes.hasNonNull("detailed_feedback")
                    ? (java.util.List<String>) objectMapper.convertValue(
                    aiRes.get("detailed_feedback"),
                    objectMapper.getTypeFactory().constructCollectionType(java.util.List.class, String.class)
            )
                    : null;
            job.markDone(objectMapper.writeValueAsString(aiRes), totalScore, feedbackTitle, detailedFeedback, coachingMessage);

        } catch (Exception e) {
            log.error("AI video analyze failed: jobId={}, interviewId={}, turnId={}",
                    jobId, job.getInterview().getId(), job.getTurnId(), e);
            job.markFailed(e.getMessage());
        }
    }
}
