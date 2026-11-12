package com.example.dapdap.users.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class UserMeResponse {
    private Long userId;
    private String email;
    private String nickname;
    private String jobTitle;
    private String bio;
    private String profileImageUrl;
    private String socialType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
