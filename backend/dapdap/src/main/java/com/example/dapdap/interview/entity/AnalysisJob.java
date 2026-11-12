package com.example.dapdap.interview.entity;

import com.example.dapdap.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor
@Entity
@Table(
        name = "analysis_jobs",
        indexes = {
                @Index(name = "idx_analysis_jobs_turn", columnList = "interview_id, turn_id"),
                @Index(name = "idx_analysis_jobs_status", columnList = "status")
        }
)
public class AnalysisJob extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "analysis_job_id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AnalysisJobType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AnalysisJobStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    @Column(name = "turn_id", nullable = false)
    private Long turnId;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "duration", column = @Column(name = "input_duration")),
            @AttributeOverride(name = "eyeContactScore", column = @Column(name = "input_eye_contact_score")),
            @AttributeOverride(name = "poseStabilityScore", column = @Column(name = "input_pose_stability_score")),
            @AttributeOverride(name = "movementScore", column = @Column(name = "input_movement_score")),
            @AttributeOverride(name = "mainEmotion", column = @Column(name = "input_main_emotion", length = 50))
    })
    private VideoAnalysisSummary inputSummary;

    @ElementCollection
    @CollectionTable(
            name = "analysis_job_input_emotions",
            joinColumns = @JoinColumn(name = "analysis_job_id")
    )
    @OrderColumn(name = "emotion_order")
    private List<VideoEmotionScore> inputEmotions = new ArrayList<>();

    // 비디오 분석 결과(면접 종료 후 조회용)
    @Lob
    @Column(name = "result_json", columnDefinition = "json")
    private String resultJson;

    // 비디오 분석 입력(MediaPipe 원본)
    @Lob
    @Column(name = "input_json", columnDefinition = "json")
    private String inputJson;

    @Column(name = "score")
    private Integer score;

    @Column(name = "feedback_title", length = 200)
    private String feedbackTitle;

    @Lob
    @Column(name = "coaching_message", columnDefinition = "TEXT")
    private String coachingMessage;

    @ElementCollection
    @CollectionTable(
            name = "analysis_job_feedbacks",
            joinColumns = @JoinColumn(name = "analysis_job_id")
    )
    @OrderColumn(name = "feedback_order")
    @Column(name = "feedback_text", columnDefinition = "TEXT")
    private List<String> detailedFeedback = new ArrayList<>();

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    public static AnalysisJob queuedVideo(Interview interview, Long turnId, String inputJson) {
        AnalysisJob j = new AnalysisJob();
        j.type = AnalysisJobType.VIDEO;
        j.status = AnalysisJobStatus.QUEUED;
        j.interview = interview;
        j.turnId = turnId;
        j.inputJson = inputJson;
        return j;
    }

    public void requeueVideo(String inputJson, VideoAnalysisSummary summary, List<VideoEmotionScore> emotions) {
        this.type = AnalysisJobType.VIDEO;
        this.status = AnalysisJobStatus.QUEUED;
        this.inputJson = inputJson;
        this.resultJson = null;
        this.score = null;
        this.feedbackTitle = null;
        this.coachingMessage = null;
        this.detailedFeedback.clear();
        this.errorMessage = null;
        applyInputSummary(summary, emotions);
    }

    public void applyInputSummary(VideoAnalysisSummary summary, List<VideoEmotionScore> emotions) {
        this.inputSummary = summary;
        this.inputEmotions.clear();
        if (emotions != null) {
            this.inputEmotions.addAll(emotions);
        }
    }

    public void markRunning() {
        this.status = AnalysisJobStatus.RUNNING;
    }

    public void markDone(String resultJson, Integer score, String feedbackTitle, List<String> detailedFeedback, String coachingMessage) {
        this.status = AnalysisJobStatus.DONE;
        this.resultJson = resultJson;
        this.score = score;
        this.feedbackTitle = feedbackTitle;
        this.coachingMessage = coachingMessage;
        this.detailedFeedback.clear();
        if (detailedFeedback != null) {
            this.detailedFeedback.addAll(detailedFeedback);
        }
    }

    public void markFailed(String errorMessage) {
        this.status = AnalysisJobStatus.FAILED;
        this.errorMessage = errorMessage;
    }
}
