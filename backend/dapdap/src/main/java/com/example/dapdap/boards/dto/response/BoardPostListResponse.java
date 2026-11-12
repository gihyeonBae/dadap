package com.example.dapdap.boards.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class BoardPostListResponse {
    private List<BoardPostListItemResponse> posts;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}
