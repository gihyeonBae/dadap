package com.example.dapdap.interview.service;

import com.example.dapdap.interview.dto.response.*;
import com.example.dapdap.interview.repository.InterviewTurnRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class StudyLogService {
    private final InterviewTurnRepository repo;

    public DailyCategoryAverageSummaryResponse getDailyCategoryAverages(long userId, LocalDate date) {
        LocalDateTime fromDt = date.atStartOfDay();
        LocalDateTime toDt = date.plusDays(1).atStartOfDay();

        List<RawAverageRow> rows = repo.findDailyCategorySessionAverages(userId, fromDt, toDt);

        Map<LocalDate, Map<Long, DailyCategoryAverageResponse>> grouped = new LinkedHashMap<>();

        for (RawAverageRow r : rows) {
            grouped.putIfAbsent(r.getDate(), new LinkedHashMap<>());
            Map<Long, DailyCategoryAverageResponse> byCat = grouped.get(r.getDate());

            byCat.putIfAbsent(r.getCategoryId(),
                    new DailyCategoryAverageResponse(r.getCategoryId(), r.getCategoryName(), new ArrayList<>())
            );

            byCat.get(r.getCategoryId()).getSessions()
                    .add(new SessionAverageResponse(r.getInterviewId(), r.getAvgScore(), r.getTurnCount()));
        }

        List<DailyAverageResponse> daily = grouped.entrySet().stream()
                .map(e -> new DailyAverageResponse(e.getKey(), new ArrayList<>(e.getValue().values())))
                .toList();

        return new DailyCategoryAverageSummaryResponse(daily);
    }

}
