package com.example.dapdap.interview.service;

import com.example.dapdap.interview.dto.response.StreakDateCountResponse;
import com.example.dapdap.interview.dto.response.StreakResponse;
import com.example.dapdap.interview.repository.InterviewDateCountRow;
import com.example.dapdap.interview.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class InterviewStreakService {
    private final InterviewRepository interviewRepository;

    public StreakResponse getCurrentStreak(long userId){
        // 날짜별 완료 인터뷰 개수 조회
        List<InterviewDateCountRow> rows = interviewRepository.findFinishedDateCountsDesc(userId);
        if (rows.isEmpty()) {
            return new StreakResponse(0, List.of(), List.of());
        }

        // 날짜 리스트 (기존 allDates 역할)
        List<LocalDate> allDates = rows.stream()
                .map(InterviewDateCountRow::getFinishedDate)
                .toList();

        // 날짜별 카운트 응답
        List<StreakDateCountResponse> dateCounts = rows.stream()
                .map(r -> new StreakDateCountResponse(
                        r.getFinishedDate(),
                        (int) r.getInterviewCount()
                ))
                .toList();

        // 기존 streak 계산 로직 유지
        Set<LocalDate> finishedSet = new HashSet<>(allDates);
        LocalDate today = LocalDate.now();

        LocalDate anchor;
        if (finishedSet.contains(today)) {
            anchor = today;
        } else if (finishedSet.contains(today.minusDays(1))) {
            anchor = today.minusDays(1);
        } else {
            return new StreakResponse(0, allDates, dateCounts);
        }

        List<LocalDate> streakDates = new ArrayList<>();
        for (LocalDate d = anchor; finishedSet.contains(d); d = d.minusDays(1)) {
            streakDates.add(d);
        }
        Collections.reverse(streakDates);

        // streakDates 대신 allDates 내려주던 기존 정책 유지
        return new StreakResponse(streakDates.size(), allDates, dateCounts);
    }
}
