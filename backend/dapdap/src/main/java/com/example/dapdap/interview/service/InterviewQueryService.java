package com.example.dapdap.interview.service;

import com.example.dapdap.interview.dto.response.AnalysisJobResultResponse;
import com.example.dapdap.interview.dto.response.InterviewListItemResponse;
import com.example.dapdap.interview.dto.response.InterviewListResponse;
import com.example.dapdap.interview.dto.response.InterviewResultResponse;
import com.example.dapdap.interview.dto.response.InterviewResultTurnResponse;
import com.example.dapdap.interview.dto.response.InterviewTurnItemResponse;
import com.example.dapdap.interview.dto.response.InterviewTurnsResponse;
import com.example.dapdap.interview.entity.AnalysisJob;
import com.example.dapdap.interview.entity.Interview;
import com.example.dapdap.interview.entity.InterviewTurn;
import com.example.dapdap.interview.entity.VideoEmotionScore;
import com.example.dapdap.interview.repository.AnalysisJobRepository;
import com.example.dapdap.interview.repository.InterviewRepository;
import com.example.dapdap.interview.repository.InterviewTurnRepository;
import com.example.dapdap.storage.service.PresignService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InterviewQueryService {

    private final InterviewRepository interviewRepository;
    private final InterviewTurnRepository turnRepository;
    private final AnalysisJobRepository jobRepository;
    private final PresignService presignService;

    @Transactional(readOnly = true)
    public InterviewListResponse getMyInterviews(Long userId) {
        List<InterviewListItemResponse> items = interviewRepository.findByUser_IdAndDeletedAtIsNullOrderByCreatedAtDesc(userId)
                .stream()
                .map(i -> new InterviewListItemResponse(
                        i.getId(),
                        i.getTitle(),
                        i.getInterviewType(),
                        i.getRunMode(),
                        i.getStatus(),
                        i.getTargetQuestionCount(),
                        i.getAskedCount(),
                        i.getStartedAt(),
                        i.getFinishedAt(),
                        i.getCreatedAt()
                ))
                .toList();
        return new InterviewListResponse(items);
    }

    @Transactional(readOnly = true)
    public InterviewTurnsResponse getTurns(Long userId, Long interviewId) {

        Interview interview = interviewRepository.findByIdAndUser_IdAndDeletedAtIsNull(interviewId, userId)
                .orElseThrow(() -> new IllegalArgumentException("면접을 찾을 수 없습니다. interviewId=" + interviewId));

        List<InterviewTurn> turns = turnRepository.findByInterview_IdOrderByTurnIndexAsc(interviewId);

        List<InterviewTurnItemResponse> items = turns.stream()
                .map(t -> new InterviewTurnItemResponse(
                        t.getId(),
                        t.getTurnIndex(),
                        t.isFollowUp(),
                        (t.getParentTurn() != null ? t.getParentTurn().getId() : null),
                        (t.getQuestion() != null ? t.getQuestion().getId() : null),
                        t.getQuestionText(),
                        t.getAnswerText(),
                        t.getFeedbackText(),
                        t.getSttScore(),
                        t.getAnalysisStatus(),
                        presignUrlOrNull(t.getAudioKey()),
                        presignUrlOrNull(t.getVideoKey())
                ))
                .toList();

        return new InterviewTurnsResponse(
                interview.getId(),
                interview.getStatus(),
                interview.getTargetQuestionCount(),
                interview.getAskedCount(),
                items
        );
    }

    @Transactional(readOnly = true)
    public InterviewResultResponse getInterviewResult(Long userId, Long interviewId) {
        Interview interview = interviewRepository.findByIdAndUser_IdAndDeletedAtIsNull(interviewId, userId)
                .orElseThrow(() -> new IllegalArgumentException("면접을 찾을 수 없습니다. interviewId=" + interviewId));

        List<InterviewTurn> turns = turnRepository.findByInterview_IdOrderByTurnIndexAsc(interviewId);
        Map<Long, List<AnalysisJob>> jobsByTurn = jobsByTurn(interviewId);

        List<InterviewResultTurnResponse> items = turns.stream()
                .map(t -> {
                    Double charsPerMin = null;
                    String ans = t.getAnswerText();
                    Integer dur = t.getVideoDuration();
                    if (ans != null && dur != null && dur > 0) {
                        int chars = ans.replaceAll("\\s+", "").length();
                        double cpm = (chars / (double) dur) * 60.0;
                        charsPerMin = Math.round(cpm * 100.0) / 100.0;
                    }
                    return new InterviewResultTurnResponse(
                            t.getId(),
                            t.getTurnIndex(),
                            t.isFollowUp(),
                            (t.getParentTurn() != null ? t.getParentTurn().getId() : null),
                            (t.getQuestion() != null ? t.getQuestion().getId() : null),
                            t.getQuestionText(),
                            t.getAnswerText(),
                            t.getFeedbackText(),
                            t.getSttScore(),
                            charsPerMin,
                            t.getAnalysisStatus(),
                            presignUrlOrNull(t.getAudioKey()),
                            presignUrlOrNull(t.getVideoKey()),
                            toJobResponses(jobsByTurn.get(t.getId()))
                    );
                })
                .toList();

        return new InterviewResultResponse(
                interview.getId(),
                interview.getStatus(),
                interview.getTargetQuestionCount(),
                interview.getAskedCount(),
                items
        );
    }

    private String presignUrlOrNull(String key) {
        if (key == null || key.isBlank()) {
            return null;
        }
        return presignService.presignDownload(key).getUrl();
    }

    private Map<Long, List<AnalysisJob>> jobsByTurn(Long interviewId) {
        List<AnalysisJob> jobs = jobRepository.findByInterview_IdOrderByIdDesc(interviewId);
        Map<Long, List<AnalysisJob>> grouped = new HashMap<>();
        for (AnalysisJob job : jobs) {
            grouped.computeIfAbsent(job.getTurnId(), k -> new java.util.ArrayList<>()).add(job);
        }
        return grouped;
    }

    private List<AnalysisJobResultResponse> toJobResponses(List<AnalysisJob> jobs) {
        if (jobs == null || jobs.isEmpty()) {
            return java.util.List.of();
        }
        return jobs.stream()
                .map(job -> {
                    List<VideoEmotionScore> inputEmotions = List.copyOf(job.getInputEmotions());
                    List<String> detailedFeedback = job.getDetailedFeedback().isEmpty() ? null : List.copyOf(job.getDetailedFeedback());
                    return new AnalysisJobResultResponse(
                            job.getId(),
                            job.getStatus(),
                            job.getScore(),
                            job.getInputSummary(),
                            inputEmotions,
                            job.getFeedbackTitle(),
                            detailedFeedback,
                            job.getCoachingMessage(),
                            job.getErrorMessage()
                    );
                })
                .toList();
    }
}

