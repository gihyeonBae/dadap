package com.example.dapdap.storage.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PresignUploadRequest {
    private String key;
    private String contentType;
}
