package com.example.dapdap.interview.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AnalyzeTurnResponse {

    private boolean finished;

    private Long interviewId;
    private Long turnId;
    private int turnIndex;

    private String questionText;
    private String answerText;
    private String feedbackText;

    private boolean followUpTurn;

    // 꼬리질문 생성 시 다음 턴 정보(없으면 null)
    private NextQuestionResponse nextTurn;
}
