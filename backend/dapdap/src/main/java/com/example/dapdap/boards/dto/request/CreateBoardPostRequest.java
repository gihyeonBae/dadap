package com.example.dapdap.boards.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateBoardPostRequest {
    private String title;
    private String content;
    private String imageUrl;
}
