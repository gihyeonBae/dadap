package com.example.dapdap.question.entity;

import com.example.dapdap.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "questions",
        indexes = {
                @Index(name = "idx_questions_category", columnList = "category_id"),
                @Index(name = "idx_questions_parent", columnList = "parent_id")
        }
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category; // 포트폴리오 질문이면 null 가능

    @Lob
    @Column(nullable = false)
    private String content;

    @Lob
    @Column(name = "model_answer", columnDefinition = "TEXT")
    private String modelAnswer;

    @Column(nullable = false)
    private Integer difficulty;

    @Column(nullable = false)
    private long views = 0L;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Question parent; // 꼬리질문 템플릿(선택)
    public void increaseViews() {
        this.views += 1;
    }
}
