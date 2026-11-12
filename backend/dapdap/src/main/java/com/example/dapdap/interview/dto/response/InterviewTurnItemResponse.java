package com.example.dapdap.interview.dto.response;

import com.example.dapdap.interview.entity.AnalysisStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class InterviewTurnItemResponse {

    private Long turnId;
    private int turnIndex;

    private boolean followUp;
    private Long parentTurnId; // ?놁쑝硫?null

    private Long questionId;
    private String questionText;
    private String answerText;
    private String feedbackText;
    private Integer sttScore;

    private AnalysisStatus analysisStatus;

    private String audioKey;
    private String videoKey;
}
