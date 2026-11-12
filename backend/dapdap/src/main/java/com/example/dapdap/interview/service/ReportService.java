package com.example.dapdap.interview.service;

import com.example.dapdap.ai.client.AiClient;
import com.example.dapdap.ai.dto.AiReportRequest;
import com.example.dapdap.ai.dto.AiReportResponse;
import com.example.dapdap.ai.dto.AiReportTurnItem;
import com.example.dapdap.interview.dto.response.ReportResponse;
import com.example.dapdap.interview.entity.Report;
import com.example.dapdap.interview.entity.ReportStatus;
import com.example.dapdap.interview.repository.ReportRepository;
import com.example.dapdap.interview.entity.Interview;
import com.example.dapdap.interview.entity.InterviewStatus;
import com.example.dapdap.interview.entity.InterviewTurn;
import com.example.dapdap.interview.repository.InterviewRepository;
import com.example.dapdap.interview.repository.InterviewTurnRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final InterviewRepository interviewRepository;
    private final InterviewTurnRepository turnRepository;
    private final ReportRepository reportRepository;

    private final AiClient aiClient;

    @Transactional(readOnly = true)
    public ReportResponse getReport(Long userId, Long interviewId) {
        Interview interview = interviewRepository.findByIdAndUser_IdAndDeletedAtIsNull(interviewId, userId)
            .orElseThrow(() -> new IllegalArgumentException("면접을 찾을 수 없습니다. interviewId=" + interviewId));

        Report report = reportRepository.findByInterview_Id(interviewId)
            .orElseThrow(() -> new IllegalArgumentException("리포트를 아직 생성하지 않았습니다."));

        return toResponse(interview.getId(), report);
    }

    /**
        * 총괄 리포트 생성 처리 (MVP: 간단 생성)
        * - 면접이 FINISHED 상태일 때만 수행
        * - report가 없으면 PENDING 상태로 생성
        * - report가 DONE이면 바로 결과 반환
        * - report가 RUNNING이면 현재 상태 반환
     */
    @Transactional
    public ReportResponse generateReport(Long userId, Long interviewId) {

        Interview interview = interviewRepository.findByIdAndUser_IdAndDeletedAtIsNull(interviewId, userId)
            .orElseThrow(() -> new IllegalArgumentException("면접을 찾을 수 없습니다. interviewId=" + interviewId));

        if (interview.getStatus() != InterviewStatus.FINISHED) {
            throw new IllegalArgumentException("면접이 종료된 이후에만 총괄 리포트를 생성할 수 있습니다.");
        }

        Report report = reportRepository.findByInterview_Id(interviewId)
                .orElseGet(() -> reportRepository.save(
                        Report.builder()
                                .interview(interview)
                                .status(ReportStatus.PENDING)
                                .totalScore(0)
                                .totalFeedback(null)
                                .fullVideoKey(null)
                                .fullAudioKey(null)
                                .summaryJson(null)
                                .build()
                ));

        // 이미 DONE 상태면 결과 반환
        if (report.getStatus() == ReportStatus.DONE) {
            return toResponse(interviewId, report);
        }
        // 생성 중(RUNNING) 상태면 현재 상태 반환 (중복 요청 방지)
        if (report.getStatus() == ReportStatus.RUNNING) {
            return toResponse(interviewId, report);
        }
        // RUNNING 상태로 변경
        report = setStatusRunning(report);

        // 턴 목록 가져오기 (turnIndex 오름차순)
        List<InterviewTurn> turns = turnRepository.findByInterview_IdOrderByTurnIndexAsc(interviewId);

        List<AiReportTurnItem> items = turns.stream()
                .map(t -> new AiReportTurnItem(
                        t.getTurnIndex(),
                        t.isFollowUp(),
                        t.getQuestionText(),
                        t.getAnswerText(),
                        t.getAudioKey(),
                        t.getVideoKey()
                ))
                .toList();

        AiReportRequest req = new AiReportRequest(interviewId, items);

        try {
            AiReportResponse aiRes = aiClient.generateReport(req);
            applyDone(report, aiRes);
        } catch (Exception e) {
            log.error("AI report generation failed: interviewId={}", interviewId, e);
            setStatusFailed(report);
            throw new IllegalStateException("총괄 리포트 생성 실패: " + e.getMessage(), e);
        }

        return toResponse(interviewId, report);
    }

    // --------------------
    // Internal helpers
    // --------------------
    private ReportResponse toResponse(Long interviewId, Report report) {
        return new ReportResponse(
                interviewId,
                report.getStatus(),
                report.getTotalScore(),
                report.getTotalFeedback(),
                report.getSummaryJson(),
                report.getFullVideoKey(),
                report.getFullAudioKey()
        );
    }

    private Report setStatusRunning(Report report) {
        // Report 엔티티에 상태 갱신 메서드를 호출
        report.markRunning();
        return report;
    }

    private void applyDone(Report report, AiReportResponse aiRes) {
        report.markDone(
                aiRes.getTotalScore(),
                aiRes.getTotalFeedback(),
                aiRes.getSummaryJson()
        );
    }

    private void setStatusFailed(Report report) {
        report.markFailed();
    }
}
