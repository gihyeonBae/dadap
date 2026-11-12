package com.example.dapdap.users.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class UserProfileUpdateResponse {
    private Long userId;
    private String email;
    private String nickname;
    private String jobTitle;
    private String bio;
    private String profileImageUrl;
    private LocalDateTime updatedAt;
}
