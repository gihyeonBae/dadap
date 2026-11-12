package com.example.dapdap.boards.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class BoardCommentResponse {
    private Long commentId;
    private Long parentCommentId;
    private String authorName;
    private String authorProfileImageUrl;
    private String content;
    private LocalDateTime createdAt;
    private List<BoardCommentResponse> replies;
}
