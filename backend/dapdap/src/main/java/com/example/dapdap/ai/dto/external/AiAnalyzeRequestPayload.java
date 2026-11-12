package com.example.dapdap.ai.dto.external;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AiAnalyzeRequestPayload {

    @JsonProperty("interview_id")
    private Long interviewId;

    @JsonProperty("current_question_id")
    private Long currentQuestionId;

    @JsonProperty("current_question_text")
    private String currentQuestionText;

    @JsonProperty("model_answer")
    private String modelAnswer;

    @JsonProperty("key_terms")
    private List<String> keyTerms;

    @JsonProperty("user_audio_url")
    private String userAudioUrl;

    @JsonProperty("user_video_url")
    private String userVideoUrl;

    @JsonProperty("next_question_candidates")
    private List<NextQuestionCandidate> nextQuestionCandidates;

    public AiAnalyzeRequestPayload(
            Long interviewId,
            Long currentQuestionId,
            String currentQuestionText,
            String modelAnswer,
            List<String> keyTerms,
            String userAudioUrl,
            String userVideoUrl,
            List<NextQuestionCandidate> nextQuestionCandidates
    ) {
        this.interviewId = interviewId;
        this.currentQuestionId = currentQuestionId;
        this.currentQuestionText = currentQuestionText;
        this.modelAnswer = modelAnswer;
        this.keyTerms = keyTerms;
        this.userAudioUrl = userAudioUrl;
        this.userVideoUrl = userVideoUrl;
        this.nextQuestionCandidates = nextQuestionCandidates;
    }

    @Getter
    @NoArgsConstructor
    public static class NextQuestionCandidate {
        @JsonProperty("id")
        private Long id;

        @JsonProperty("text")
        private String text;

        public NextQuestionCandidate(Long id, String text) {
            this.id = id;
            this.text = text;
        }
    }
}
