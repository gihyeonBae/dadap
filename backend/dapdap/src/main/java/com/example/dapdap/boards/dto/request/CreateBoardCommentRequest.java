package com.example.dapdap.boards.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateBoardCommentRequest {
    private String content;
    private Long parentCommentId;
}
