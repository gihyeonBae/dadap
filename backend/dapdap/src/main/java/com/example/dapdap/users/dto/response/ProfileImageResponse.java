package com.example.dapdap.users.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ProfileImageResponse {
    private String profileImageUrl;
    private LocalDateTime updatedAt;
}
