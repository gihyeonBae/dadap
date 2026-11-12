package com.example.dapdap.interview.dto.request;

import com.example.dapdap.interview.entity.InterviewType;
import com.example.dapdap.interview.entity.RunMode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class InterviewCreateRequest {

    private InterviewType interviewType;   // CS / PORTFOLIO
    private RunMode runMode;               // PRACTICE / REAL

    private Long categoryId;               // CS면접이면 필수
    private Long portfolioId;              // PORTFOLIO면접이면 선택(또는 필수 정책 가능)

    private Integer targetQuestionCount;   // 총 질문 수(꼬리질문 포함)
    private String optionJson;             // 선택(난이도/시간 등)
}
