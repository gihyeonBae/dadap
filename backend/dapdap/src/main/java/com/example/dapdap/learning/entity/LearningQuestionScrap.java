package com.example.dapdap.learning.entity;

import com.example.dapdap.global.entity.BaseTimeEntity;
import com.example.dapdap.question.entity.Question;
import com.example.dapdap.users.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "learning_question_scraps", uniqueConstraints = {
        @UniqueConstraint(name = "uk_learning_question_scrap", columnNames = {"question_id", "user_id"})
})
public class LearningQuestionScrap extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "scrap_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public LearningQuestionScrap(Question question, User user) {
        this.question = question;
        this.user = user;
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }

    public void recover() {
        this.deletedAt = null;
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }
}
