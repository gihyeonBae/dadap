package com.example.dapdap.portfolio.entity;

import com.example.dapdap.users.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Table(name = "portfolios")
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
// [Soft Delete 핵심 설정]
// 1. repository.delete() 실행 시 -> UPDATE 쿼리로 실행
@SQLDelete(sql = "UPDATE portfolios SET deleted_at = NOW() WHERE portfolio_id = ?")
// 2. 조회 시 -> 삭제 안 된 것만 가져오기 (deleted_at IS NULL)
@SQLRestriction("deleted_at IS NULL")
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "portfolio_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PortfolioType type;

    @Column(name = "file_key", nullable = false, length = 500)
    private String fileKey;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(name = "original_filename")
    private String originalFilename;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "file_size")
    private Long fileSize;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // [New] 삭제 일시 (Soft Delete용)
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // 포트폴리오가 Soft Delete 되면, 연관된 질문들도 같이 Soft Delete 되어야 함
    @OneToMany(mappedBy = "portfolio", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PortfolioQuestion> questions = new ArrayList<>();

    @Builder
    public Portfolio(User user, String title, PortfolioType type, String fileKey, String fileUrl,
                     String originalFilename, String contentType, Long fileSize) {
        this.user = user;
        this.title = title;
        this.type = type;
        this.fileKey = fileKey;
        this.fileUrl = fileUrl;
        this.originalFilename = originalFilename;
        this.contentType = contentType;
        this.fileSize = fileSize;
    }
}