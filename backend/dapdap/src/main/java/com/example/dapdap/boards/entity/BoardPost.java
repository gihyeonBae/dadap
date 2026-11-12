package com.example.dapdap.boards.entity;

import com.example.dapdap.global.entity.BaseTimeEntity;
import com.example.dapdap.users.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "board_posts", indexes = {
        @Index(name = "idx_board_posts_created", columnList = "created_at"),
        @Index(name = "idx_board_posts_author", columnList = "author_id")
})
@SQLDelete(sql = "UPDATE board_posts SET deleted_at = NOW() WHERE post_id = ?")
@SQLRestriction("deleted_at IS NULL")
public class BoardPost extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(nullable = false)
    private long views = 0L;

    @Column(nullable = false)
    private long likes = 0L;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BoardComment> comments = new ArrayList<>();

    public BoardPost(String title, String content, String imageUrl, User author) {
        this.title = title;
        this.content = content;
        this.imageUrl = imageUrl;
        this.author = author;
    }

    public void update(String title, String content, String imageUrl) {
        if (title != null) {
            this.title = title;
        }
        if (content != null) {
            this.content = content;
        }
        if (imageUrl != null) {
            this.imageUrl = imageUrl;
        }
    }

    public void increaseViews() {
        this.views += 1;
    }

    public void increaseLikes() {
        this.likes += 1;
    }

    public void decreaseLikes() {
        if (this.likes > 0) {
            this.likes -= 1;
        }
    }
}
