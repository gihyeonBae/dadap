package com.example.dapdap.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {

    private Long userId;
    private String email;
    private String nickname;
    private String role;
    private String accessToken;
    private String profileImageUrl;
    private String socialType;
}
