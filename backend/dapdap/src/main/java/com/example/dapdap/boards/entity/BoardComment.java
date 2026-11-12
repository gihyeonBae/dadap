package com.example.dapdap.boards.entity;

import com.example.dapdap.global.entity.BaseTimeEntity;
import com.example.dapdap.users.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "board_comments", indexes = {
        @Index(name = "idx_board_comments_post", columnList = "post_id"),
        @Index(name = "idx_board_comments_parent", columnList = "parent_id")
})
public class BoardComment extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private BoardPost post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private BoardComment parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BoardComment> children = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    public BoardComment(BoardPost post, BoardComment parent, User author, String content) {
        this.post = post;
        this.parent = parent;
        this.author = author;
        this.content = content;
    }
}
