package com.example.dapdap.ai.mapper;

import com.example.dapdap.ai.dto.AiAnalyzeRequest;
import com.example.dapdap.ai.dto.AiAnalyzeResponse;
import com.example.dapdap.ai.dto.external.AiAnalyzeRequestPayload;
import com.example.dapdap.ai.dto.external.AiAnalyzeResponsePayload;
import com.example.dapdap.storage.service.PresignService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class AiAnalyzeMapper {

    private final PresignService presignService;
    private final ObjectMapper objectMapper;

    public AiAnalyzeRequestPayload toExternal(AiAnalyzeRequest request) {
        String audioUrl = presignUrlOrNull(request.getAudioKey());
        String videoUrl = presignUrlOrNull(request.getVideoKey());

        List<AiAnalyzeRequestPayload.NextQuestionCandidate> candidates =
                request.getNextQuestionCandidates().stream()
                        .map(c -> new AiAnalyzeRequestPayload.NextQuestionCandidate(c.getId(), c.getText()))
                        .toList();

        return new AiAnalyzeRequestPayload(
                request.getInterviewId(),
                request.getCurrentQuestionId(),
                request.getQuestionText(),
                request.getModelAnswer(),
                request.getKeyTerms(),
                audioUrl,
                videoUrl,
                candidates
        );
    }

    public AiAnalyzeResponse toInternal(AiAnalyzeResponsePayload payload) {
        if (payload == null) {
            throw new IllegalStateException("AI response is empty.");
        }
        if (payload.getStatus() != null && !"success".equalsIgnoreCase(payload.getStatus())) {
            String message = payload.getMessage() != null ? payload.getMessage() : "AI response failed.";
            throw new IllegalStateException(message);
        }

        AiAnalyzeResponsePayload.Evaluation eval = payload.getEvaluation();

        Integer score = eval != null ? eval.getScore() : null;
        String feedbackText = eval != null ? eval.getFeedback() : null;

        String feedbackJson = buildFeedbackJson(eval);

        return AiAnalyzeResponse.builder()
                .isFollowUp(false)
                .nextQuestionText(null)
                .answerText(payload.getSttText())
                .questionText(null)
                .feedbackText(feedbackText)
                .score(score)
                .feedbackJson(feedbackJson)
                .selectedQuestionId(payload.getSelectedQuestionId())
                .selectedQuestionText(payload.getSelectedQuestionText())
                .build();
    }

    private String presignUrlOrNull(String key) {
        if (key == null || key.isBlank()) {
            return null;
        }
        return presignService.presignDownload(key).getUrl();
    }

    private String buildFeedbackJson(AiAnalyzeResponsePayload.Evaluation eval) {
        if (eval == null) {
            return null;
        }

        Map<String, Object> payload = Map.of(
                "missing_keywords", eval.getMissingKeywords(),
                "found_keywords", eval.getFoundKeywords()
        );

        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            return null;
        }
    }
}
