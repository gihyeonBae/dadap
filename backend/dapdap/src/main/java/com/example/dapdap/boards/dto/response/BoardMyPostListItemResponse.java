package com.example.dapdap.boards.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class BoardMyPostListItemResponse {
    private Long postId;
    private String title;
    private String excerpt;
    private String authorName;
    private String imageUrl;
    private long views;
    private long likes;
    private long commentCount;
    private boolean liked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime likedAt;
}
