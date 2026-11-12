package com.example.dapdap.interview.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TurnMediaUploadResponse {
    private Long interviewId;
    private Long turnId;
    private int turnIndex;
    private String mediaType;   // "AUDIO" or "VIDEO"
    private String key;         // S3 object key
    private long size;
    private String contentType;
}
