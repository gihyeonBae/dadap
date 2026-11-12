package com.example.dapdap.interview.entity;

import com.example.dapdap.global.entity.BaseTimeEntity;
import com.example.dapdap.portfolio.entity.PortfolioQuestion;
import com.example.dapdap.question.entity.Question;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "interview_turns",
        uniqueConstraints = @UniqueConstraint(name = "uk_interview_turn", columnNames = {"interview_id", "turn_index"}),
        indexes = {
                @Index(name = "idx_turns_interview_turn", columnList = "interview_id, turn_index"),
                @Index(name = "idx_turns_question", columnList = "question_id"),
                @Index(name = "idx_turns_portfolio_question", columnList = "portfolio_question_id"),
                @Index(name = "idx_turns_parent", columnList = "parent_turn_id")
        }
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewTurn extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "turn_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    @Column(name = "turn_index", nullable = false)
    private int turnIndex;

    @Column(name = "is_followup", nullable = false)
    private boolean followUp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_turn_id")
    private InterviewTurn parentTurn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    private Question question; // 질문은행(CS) 기반이면 설정

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_question_id")
    private PortfolioQuestion portfolioQuestion; // 포트폴리오 기반이면 설정

    @Lob
    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText; // 스냅샷

    @Lob
    @Column(name = "answer_text", columnDefinition = "TEXT")
    private String answerText;

    @Column(name = "audio_key", length = 500)
    private String audioKey;

    @Column(name = "video_key", length = 500)
    private String videoKey;

    @Column(name = "video_duration")
    private Integer videoDuration;

    @Lob
    @Column(name = "feedback_text", columnDefinition = "TEXT")
    private String feedbackText;

    @Column(name = "feedback_json", columnDefinition = "json")
    private String feedbackJson;

    @Column(name = "stt_score")
    private Integer sttScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "analysis_status", nullable = false, length = 20)
    private AnalysisStatus analysisStatus;

    public void updateAudioKey(String audioKey) {
        this.audioKey = audioKey;
    }

    public void updateVideoKey(String videoKey) {
        this.videoKey = videoKey;
    }

    public void updateVideoDuration(Integer seconds) {
        this.videoDuration = seconds;
    }

    public void markAnalysisRunning() {
        this.analysisStatus = AnalysisStatus.RUNNING;
    }

    public void markAnalysisDone() {
        this.analysisStatus = AnalysisStatus.DONE;
    }

    public void markAnalysisFailed() {
        this.analysisStatus = AnalysisStatus.FAILED;
    }

    public void applyAnalysisResult(String answerText, String feedbackText, String feedbackJson, Integer score) {
        this.answerText = answerText;
        this.feedbackText = feedbackText;
        this.feedbackJson = feedbackJson;
        this.sttScore = score;
    }

}
