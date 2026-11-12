package com.example.dapdap.boards.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class BoardMyPostListResponse {
    private String type;
    private List<BoardMyPostListItemResponse> posts;
}
