package com.example.dapdap.ai.service;

import com.example.dapdap.ai.client.AiClient;
import com.example.dapdap.ai.config.AiProperties;
import com.example.dapdap.ai.dto.AiAnalyzeRequest;
import com.example.dapdap.ai.dto.AiAnalyzeResponse;
import com.example.dapdap.ai.mapper.AiAnalyzeMapper;
import com.example.dapdap.ai.dto.external.AiAnalyzeRequestPayload;
import com.example.dapdap.ai.dto.external.AiAnalyzeResponsePayload;
import com.example.dapdap.interview.entity.InterviewType;
import lombok.RequiredArgsConstructor;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiAnalyzeService {

    private final AiClient aiClient;
    private final AiProperties props;
    private final AiAnalyzeMapper mapper;

    public AiAnalyzeResponse analyze(AiAnalyzeRequest request) {
        if (props.isMock()) return mockResponse(request);
        return analyzeWithRetry(request);
    }

    public AiAnalyzeResponse analyzeAudio(AiAnalyzeRequest request, InterviewType interviewType) {
        if (props.isMock()) return mockResponse(request);
        return analyzeAudioWithRetry(request, interviewType);
    }

    public AiAnalyzeResponse analyzeVideo(AiAnalyzeRequest request) {
        if (props.isMock()) return mockResponse(request);
        return analyzeVideoWithRetry(request);
    }

    @Retryable(retryFor = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 700, multiplier = 2.0))
    protected AiAnalyzeResponse analyzeWithRetry(AiAnalyzeRequest request) {
        AiAnalyzeRequestPayload payload = mapper.toExternal(request);
        AiAnalyzeResponsePayload res = aiClient.analyze(payload);
        if (res == null) throw new IllegalStateException("AI response is empty.");
        return mapper.toInternal(res);
    }

    @Retryable(retryFor = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 700, multiplier = 2.0))
    protected AiAnalyzeResponse analyzeAudioWithRetry(AiAnalyzeRequest request, InterviewType interviewType) {
        AiAnalyzeRequestPayload payload = mapper.toExternal(request);
        AiAnalyzeResponsePayload res = aiClient.analyzeAudio(payload, interviewType);
        if (res == null) throw new IllegalStateException("AI response (audio) is empty.");
        return mapper.toInternal(res);
    }

    @Retryable(retryFor = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 700, multiplier = 2.0))
    protected AiAnalyzeResponse analyzeVideoWithRetry(AiAnalyzeRequest request) {
        AiAnalyzeRequestPayload payload = mapper.toExternal(request);
        AiAnalyzeResponsePayload res = aiClient.analyzeVideo(payload);
        if (res == null) throw new IllegalStateException("AI response (video) is empty.");
        return mapper.toInternal(res);
    }

    private AiAnalyzeResponse mockResponse(AiAnalyzeRequest request) {
        return AiAnalyzeResponse.builder()
                .isFollowUp(false)
                .nextQuestionText(null)
                .questionText(request.getQuestionText())
                .answerText("MOCK STT text")
                .feedbackText("MOCK feedback text")
                .score(75)
                .feedbackJson("{\"mock\":true}")
                .selectedQuestionId(null)
                .selectedQuestionText(null)
                .build();
    }
}
