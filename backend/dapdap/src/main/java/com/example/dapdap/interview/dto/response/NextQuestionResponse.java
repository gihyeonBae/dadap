package com.example.dapdap.interview.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class NextQuestionResponse {
    private Long interviewId;
    private Long turnId;
    private int turnIndex;
    private String questionText;
    private boolean isFollowUp;
    private Long parentTurnId; // 부모 턴 ID (없으면 null)
    private List<String> keywords;
}
