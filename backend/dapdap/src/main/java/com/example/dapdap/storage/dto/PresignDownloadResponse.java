package com.example.dapdap.storage.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PresignDownloadResponse {
    private String key;
    private String url;
    private long expiresInSeconds;
}
