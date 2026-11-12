package com.example.dapdap.interview.entity;

import com.example.dapdap.global.entity.BaseTimeEntity;
import com.example.dapdap.question.entity.Category;
import com.example.dapdap.users.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "interviews",
        indexes = {
                @Index(name = "idx_interviews_user", columnList = "user_id"),
                @Index(name = "idx_interviews_portfolio", columnList = "portfolio_id"),
                @Index(name = "idx_interviews_category", columnList = "category_id"),
                @Index(name = "idx_interviews_status_created", columnList = "status, created_at")
        }
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interview_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "title", length = 200)
    private String title;

    // 포트폴리오 도메인을 아직 엔티티로 안 만들었다면 Long으로 보관해도 됨
    @Column(name = "portfolio_id")
    private Long portfolioId;

    @Enumerated(EnumType.STRING)
    @Column(name = "interview_type", nullable = false, length = 20)
    private InterviewType interviewType; // CS / PORTFOLIO

    @Enumerated(EnumType.STRING)
    @Column(name = "run_mode", nullable = false, length = 20)
    private RunMode runMode; // PRACTICE / REAL

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category; // CS면접이면 필수(앱 레벨에서 강제), PORTFOLIO면 null

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InterviewStatus status;

    @Column(name = "target_question_count", nullable = false)
    private int targetQuestionCount;

    @Column(name = "asked_count", nullable = false)
    private int askedCount;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    @Column(name = "option_json", columnDefinition = "json")
    private String optionJson;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public void startIfNeeded() {
        if (this.startedAt == null) this.startedAt = LocalDateTime.now();
    }

    public void increaseAskedCount() {
        this.askedCount += 1;
    }

    public boolean isFinishedByCount() {
        return this.askedCount >= this.targetQuestionCount;
    }

    public void finish() {
        this.status = InterviewStatus.FINISHED;
        this.finishedAt = LocalDateTime.now();
    }

    public void updateTitle(String title) {
        this.title = title;
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
        this.status = InterviewStatus.CANCELLED;
    }
}
