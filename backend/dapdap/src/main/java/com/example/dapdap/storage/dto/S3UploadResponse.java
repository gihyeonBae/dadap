package com.example.dapdap.storage.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class S3UploadResponse {
    private String key;
    private long size;
    private String contentType;
}
