package com.example.dapdap.boards.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class BoardPostListItemResponse {
    private Long postId;
    private String title;
    private String authorName;
    private String authorProfileImageUrl;
    private long views;
    private long likes;
    private boolean liked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
