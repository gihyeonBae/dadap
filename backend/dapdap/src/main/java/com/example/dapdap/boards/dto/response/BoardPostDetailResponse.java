package com.example.dapdap.boards.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class BoardPostDetailResponse {
    private Long postId;
    private String title;
    private String authorName;
    private String authorProfileImageUrl;
    private String content;
    private String imageUrl;
    private long views;
    private long likes;
    private boolean liked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<BoardCommentResponse> comments;
}
