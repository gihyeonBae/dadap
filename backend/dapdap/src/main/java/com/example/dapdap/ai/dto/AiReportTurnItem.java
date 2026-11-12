package com.example.dapdap.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AiReportTurnItem {
    private int turnIndex;
    private boolean followUp;

    private String questionText;
    private String answerText;

    private String audioKey;
    private String videoKey;
}
