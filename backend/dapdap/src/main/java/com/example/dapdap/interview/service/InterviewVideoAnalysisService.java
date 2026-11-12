package com.example.dapdap.interview.service;

import com.example.dapdap.interview.dto.response.VideoAnalysisAcceptedResponse;
import com.example.dapdap.interview.dto.response.VideoAnalysisJobStartResponse;
import com.example.dapdap.interview.dto.response.VideoAnalysisResultResponse;
import com.example.dapdap.interview.entity.AnalysisJob;
import com.example.dapdap.interview.entity.AnalysisJobStatus;
import com.example.dapdap.interview.entity.Interview;
import com.example.dapdap.interview.entity.InterviewStatus;
import com.example.dapdap.interview.entity.VideoAnalysisSummary;
import com.example.dapdap.interview.entity.VideoEmotionScore;
import com.example.dapdap.interview.event.VideoAnalysisRequestedEvent;
import com.example.dapdap.interview.repository.AnalysisJobRepository;
import com.example.dapdap.interview.repository.InterviewRepository;
import com.example.dapdap.interview.repository.InterviewTurnRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InterviewVideoAnalysisService {

    private final InterviewRepository interviewRepository;
    private final InterviewTurnRepository turnRepository;
    private final AnalysisJobRepository jobRepository;
    private final ObjectMapper objectMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public VideoAnalysisJobStartResponse startVideoAnalysis(Long userId, Long interviewId, Long turnId) {
        throw new IllegalArgumentException("비디오 분석은 /api/interviews/{interviewId}/turns/{turnId}/video-analysis API로 요청해야 합니다.");
    }

    @Transactional
    public VideoAnalysisAcceptedResponse submitVideoAnalysis(Long userId, Long interviewId, Long turnId, JsonNode payload) {
        Interview interview = interviewRepository.findByIdAndUser_IdAndDeletedAtIsNull(interviewId, userId)
            .orElseThrow(() -> new IllegalArgumentException("면접을 찾을 수 없습니다. interviewId=" + interviewId));

        if (interview.getStatus() != InterviewStatus.IN_PROGRESS) {
            throw new IllegalArgumentException("진행 중인 면접이 아닙니다. status=" + interview.getStatus());
        }

        turnRepository.findByIdAndInterview_Id(turnId, interviewId)
            .orElseThrow(() -> new IllegalArgumentException("턴을 찾을 수 없습니다. turnId=" + turnId));

        String inputJson = writeJson(payload);
        VideoAnalysisSummary summary = parseSummary(payload);
        List<VideoEmotionScore> emotions = parseEmotions(payload);

        AnalysisJob saved = jobRepository.findTopByInterview_IdAndTurnIdOrderByIdDesc(interviewId, turnId)
                .map(existing -> {
                    existing.requeueVideo(inputJson, summary, emotions);
                    return existing;
                })
                .orElseGet(() -> {
                    AnalysisJob job = AnalysisJob.queuedVideo(interview, turnId, inputJson);
                    job.applyInputSummary(summary, emotions);
                    return job;
                });
        saved = jobRepository.save(saved);

        // persist input duration from summary into interview turn (if present)
        if (summary != null && summary.getDuration() != null) {
            turnRepository.findByIdAndInterview_Id(turnId, interviewId)
                    .ifPresent(turn -> {
                        turn.updateVideoDuration(summary.getDuration());
                        turnRepository.save(turn);
                    });
        }

        eventPublisher.publishEvent(new VideoAnalysisRequestedEvent(saved.getId(), userId));

        return new VideoAnalysisAcceptedResponse(interviewId, turnId, saved.getId(), "PROCESSING");
    }

    @Transactional(readOnly = true)
    public VideoAnalysisResultResponse getVideoAnalysis(Long userId, Long interviewId, Long turnId) {
        interviewRepository.findByIdAndUser_IdAndDeletedAtIsNull(interviewId, userId)
            .orElseThrow(() -> new IllegalArgumentException("면접을 찾을 수 없습니다. interviewId=" + interviewId));

        turnRepository.findByIdAndInterview_Id(turnId, interviewId)
            .orElseThrow(() -> new IllegalArgumentException("턴을 찾을 수 없습니다. turnId=" + turnId));

        AnalysisJob job = jobRepository.findTopByInterview_IdAndTurnIdOrderByIdDesc(interviewId, turnId)
                .orElseThrow(() -> new IllegalArgumentException("video analysis job not found."));

        String status = mapStatus(job.getStatus());
        if (job.getStatus() != AnalysisJobStatus.DONE || job.getResultJson() == null) {
            return new VideoAnalysisResultResponse(status, null, null, null, null);
        }

        List<String> detailedFeedback = job.getDetailedFeedback().isEmpty() ? null : job.getDetailedFeedback();

        return new VideoAnalysisResultResponse(
                status,
                job.getScore(),
                job.getFeedbackTitle(),
                detailedFeedback,
                job.getCoachingMessage()
        );
    }

    private String mapStatus(AnalysisJobStatus status) {
        return switch (status) {
            case QUEUED, RUNNING -> "PROCESSING";
            case DONE -> "DONE";
            case FAILED -> "FAILED";
        };
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("video analysis payload serialization failed.", e);
        }
    }

    private VideoAnalysisSummary parseSummary(JsonNode payload) {
        JsonNode summary = payload != null ? payload.get("summary") : null;
        if (summary == null || summary.isNull()) {
            return null;
        }
        Integer duration = asInt(summary, "duration");
        Integer eyeContactScore = asInt(summary, "eyeContactScore");
        Integer poseStabilityScore = asInt(summary, "poseStabilityScore");
        Integer movementScore = asInt(summary, "movementScore");
        String mainEmotion = asText(summary, "mainEmotion");
        return new VideoAnalysisSummary(duration, eyeContactScore, poseStabilityScore, movementScore, mainEmotion);
    }

    private List<VideoEmotionScore> parseEmotions(JsonNode payload) {
        JsonNode summary = payload != null ? payload.get("summary") : null;
        if (summary == null || summary.isNull()) {
            return null;
        }
        JsonNode top3 = summary.get("emotionTop3");
        if (top3 == null || !top3.isArray()) {
            return null;
        }
        List<VideoEmotionScore> emotions = new java.util.ArrayList<>();
        for (JsonNode node : top3) {
            String emotion = asText(node, "emotion");
            Integer percent = asInt(node, "percent");
            emotions.add(new VideoEmotionScore(emotion, percent));
        }
        return emotions;
    }

    private Integer asInt(JsonNode node, String field) {
        return node.hasNonNull(field) ? node.get(field).asInt() : null;
    }

    private String asText(JsonNode node, String field) {
        return node.hasNonNull(field) ? node.get(field).asText() : null;
    }
}
