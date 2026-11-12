package com.example.dapdap.interview.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
public class RawAverageRow {

    private Long interviewId;
    private LocalDate date;
    private Long categoryId;
    private String categoryName;
    private int avgScore;
    private long turnCount;

    // ✅ JPQL에서 쓰는 생성자
    public RawAverageRow(
            Long interviewId,
            LocalDateTime finishedAt,
            Long categoryId,
            String categoryName,
            Double avgScore,
            Long turnCount
    ) {
        this.interviewId = interviewId;
        this.date = finishedAt.toLocalDate();
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.avgScore = avgScore == null ? 0 : avgScore.intValue();
        this.turnCount = turnCount;
    }
}
