package com.example.dapdap.interview.entity;

import com.example.dapdap.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "reports",
        uniqueConstraints = @UniqueConstraint(name = "uk_reports_interview", columnNames = "interview_id")
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportStatus status;

    @Column(name = "total_score", nullable = false)
    private int totalScore;

    @Lob
    @Column(name = "total_feedback")
    private String totalFeedback;

    @Column(name = "full_video_key", length = 500)
    private String fullVideoKey;

    @Column(name = "full_audio_key", length = 500)
    private String fullAudioKey;

    @Column(name = "summary_json", columnDefinition = "json")
    private String summaryJson;

    public void markRunning() {
        this.status = ReportStatus.RUNNING;
    }

    public void markDone(int totalScore, String totalFeedback, String summaryJson) {
        this.status = ReportStatus.DONE;
        this.totalScore = totalScore;
        this.totalFeedback = totalFeedback;
        this.summaryJson = summaryJson;
    }

    public void markFailed() {
        this.status = ReportStatus.FAILED;
    }

}
