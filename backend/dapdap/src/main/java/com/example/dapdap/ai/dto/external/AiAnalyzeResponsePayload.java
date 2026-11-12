package com.example.dapdap.ai.dto.external;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AiAnalyzeResponsePayload {

    @JsonProperty("status")
    private String status;

    @JsonProperty("stt_text")
    private String sttText;

    @JsonProperty("evaluation")
    private Evaluation evaluation;

    @JsonProperty("selected_question_id")
    private Long selectedQuestionId;

    @JsonProperty("selected_question_text")
    private String selectedQuestionText;

    @JsonProperty("error_code")
    private String errorCode;

    @JsonProperty("message")
    private String message;

    @Getter
    @NoArgsConstructor
    public static class Evaluation {
        @JsonProperty("score")
        private Integer score;

        @JsonProperty("feedback")
        private String feedback;

        @JsonProperty("missing_keywords")
        private List<String> missingKeywords;

        @JsonProperty("found_keywords")
        private List<String> foundKeywords;
    }
}
