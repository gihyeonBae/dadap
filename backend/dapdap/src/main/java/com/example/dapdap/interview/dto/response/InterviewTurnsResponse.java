package com.example.dapdap.interview.dto.response;

import com.example.dapdap.interview.entity.InterviewStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class InterviewTurnsResponse {

    private Long interviewId;
    private InterviewStatus status;

    private int targetQuestionCount;
    private int askedCount;

    private List<InterviewTurnItemResponse> turns;
}
