package com.example.dapdap.boards.entity;

import com.example.dapdap.global.entity.BaseTimeEntity;
import com.example.dapdap.users.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "board_post_likes", uniqueConstraints = {
        @UniqueConstraint(name = "uk_board_post_like", columnNames = {"post_id", "user_id"})
})
public class BoardPostLike extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "like_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private BoardPost post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public BoardPostLike(BoardPost post, User user) {
        this.post = post;
        this.user = user;
    }
}
