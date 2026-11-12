package com.example.dapdap.learning.entity;

import com.example.dapdap.question.entity.Question;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "question_keywords")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class QuestionKeyword {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "keyword_id")
    private Long keywordId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "keyword", nullable = false, length = 100)
    private String keyword;

    @Column(name = "score_weight", nullable = false)
    private Integer scoreWeight;
}
