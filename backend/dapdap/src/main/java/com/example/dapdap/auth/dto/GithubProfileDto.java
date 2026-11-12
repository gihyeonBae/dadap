package com.example.dapdap.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GithubProfileDto {
    private Long id;
    private String login;
    private String name;
    private String avatar_url;
}
