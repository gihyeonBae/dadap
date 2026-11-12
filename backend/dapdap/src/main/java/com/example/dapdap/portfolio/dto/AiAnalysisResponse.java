package com.example.dapdap.portfolio.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.List;

@Getter
@NoArgsConstructor
@ToString
public class AiAnalysisResponse {

    private List<AiQuestionDto> questions;

    @Getter
    @NoArgsConstructor
    @ToString
    public static class AiQuestionDto {
        private String topic;   // 메인 질문용 주제
        private String intent;  // 질문 의도

        // AI 서버 응답 필드명 매핑 (parent_question)
        @JsonProperty("parent_question")
        private String parentQuestion; // 메인 질문 내용

        private String content;        // 꼬리 질문 내용

        // 재귀 구조: 꼬리 질문 리스트
        @JsonProperty("tail_questions")
        private List<AiQuestionDto> tailQuestions;

        // 실제 질문 내용을 꺼내는 편의 메서드
        // 메인 질문이면 parentQuestion, 꼬리 질문이면 content를 반환
        public String getQuestionContent() {
            return parentQuestion != null ? parentQuestion : content;
        }
    }
}