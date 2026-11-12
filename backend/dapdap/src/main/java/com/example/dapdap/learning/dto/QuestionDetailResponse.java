package com.example.dapdap.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDetailResponse {
    Long questionId;
    int difficulty;
    Long parentId;
    String content;
    String modelAnswer;
    long views;
    List<FollowUpQuestionResponse> followUpQuestions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FollowUpQuestionResponse {
        Long questionId;
        String content;
        String modelAnswer;
    }
}
