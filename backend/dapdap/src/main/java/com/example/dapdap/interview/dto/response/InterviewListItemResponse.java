package com.example.dapdap.interview.dto.response;

import com.example.dapdap.interview.entity.InterviewStatus;
import com.example.dapdap.interview.entity.InterviewType;
import com.example.dapdap.interview.entity.RunMode;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class InterviewListItemResponse {
    private Long interviewId;
    private String title;
    private InterviewType interviewType;
    private RunMode runMode;
    private InterviewStatus status;
    private int targetQuestionCount;
    private int askedCount;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private LocalDateTime createdAt;
}
