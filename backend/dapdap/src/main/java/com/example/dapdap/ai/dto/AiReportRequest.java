package com.example.dapdap.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class AiReportRequest {
    private Long interviewId;
    private List<AiReportTurnItem> turns;
}
