package com.example.dapdap.ai.dto;

import lombok.Getter;

import java.util.Collections;
import java.util.List;

@Getter
public class AiAnalyzeRequest {
    private Long interviewId;
    private Long turnId;
    private String questionText;

    private String audioKey; // ?ㅻ뵒??遺꾩꽍 ???꾩닔
    private String videoKey; // 鍮꾨뵒??遺꾩꽍 ???꾩닔

    private Long currentQuestionId;
    private String modelAnswer;
    private List<String> keyTerms;
    private List<NextQuestionCandidate> nextQuestionCandidates;

    public AiAnalyzeRequest(
            Long interviewId,
            Long turnId,
            String questionText,
            String audioKey,
            String videoKey,
            Long currentQuestionId,
            String modelAnswer,
            List<String> keyTerms,
            List<NextQuestionCandidate> nextQuestionCandidates
    ) {
        this.interviewId = interviewId;
        this.turnId = turnId;
        this.questionText = questionText;
        this.audioKey = audioKey;
        this.videoKey = videoKey;
        this.currentQuestionId = currentQuestionId;
        this.modelAnswer = modelAnswer;
        this.keyTerms = keyTerms != null ? keyTerms : Collections.emptyList();
        this.nextQuestionCandidates = nextQuestionCandidates != null ? nextQuestionCandidates : Collections.emptyList();
    }

    // ?ㅻ뵒???꾩슜
    public static AiAnalyzeRequest audioOnly(Long interviewId, Long turnId, String questionText, String audioKey) {
        return new AiAnalyzeRequest(
                interviewId,
                turnId,
                questionText,
                audioKey,
                null,
                null,
                null,
                Collections.emptyList(),
                Collections.emptyList()
        );
    }

    // 鍮꾨뵒???꾩슜
    public static AiAnalyzeRequest videoOnly(Long interviewId, Long turnId, String questionText, String videoKey) {
        return new AiAnalyzeRequest(
                interviewId,
                turnId,
                questionText,
                null,
                videoKey,
                null,
                null,
                Collections.emptyList(),
                Collections.emptyList()
        );
    }

    @Getter
    public static class NextQuestionCandidate {
        private final Long id;
        private final String text;

        public NextQuestionCandidate(Long id, String text) {
            this.id = id;
            this.text = text;
        }
    }
}
