package com.example.dapdap.portfolio.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Table(name = "portfolio_questions")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
// [Soft Delete 설정]
@SQLDelete(sql = "UPDATE portfolio_questions SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class PortfolioQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(length = 255)
    private String intent;

    @Column(length = 100)
    private String topic;

    private int depth;

    // [New] 삭제 일시
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // ==========================================
    // 🔗 연관 관계
    // ==========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private PortfolioQuestion parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PortfolioQuestion> children = new ArrayList<>();

    @Builder
    public PortfolioQuestion(String content, String intent, String topic, int depth, Portfolio portfolio, PortfolioQuestion parent) {
        this.content = content;
        this.intent = intent;
        this.topic = topic;
        this.depth = depth;
        this.portfolio = portfolio;
        this.parent = parent;
    }

    public void addChild(PortfolioQuestion child) {
        this.children.add(child);
        child.setParent(this);
    }

    private void setParent(PortfolioQuestion parent) {
        this.parent = parent;
    }
}