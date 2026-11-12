package com.example.dapdap.boards.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BoardPostActionResponse {
    private Long postId;
    private long views;
    private long likes;
    private boolean liked;
}
