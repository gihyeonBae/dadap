package com.example.dapdap.auth.entity;

import com.example.dapdap.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "refresh_tokens",
        uniqueConstraints = @UniqueConstraint(name = "uk_refresh_tokens_user_id", columnNames = "user_id"))
public class RefreshToken extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 2048)
    private String token;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private com.example.dapdap.users.entity.User user;

    public RefreshToken(com.example.dapdap.users.entity.User user, String token) {
        this.user = user;
        this.token = token;
    }

    public void rotate(String token) {
        this.token = token;
    }
}

