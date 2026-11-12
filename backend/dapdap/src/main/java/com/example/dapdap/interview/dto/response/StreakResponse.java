package com.example.dapdap.interview.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@AllArgsConstructor
public class StreakResponse {
    private int currentStreak;
    private List<LocalDate> streakDates;
    private List<StreakDateCountResponse> streakDateCounts;
}
