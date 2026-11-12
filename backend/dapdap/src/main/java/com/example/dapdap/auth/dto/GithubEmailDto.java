package com.example.dapdap.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GithubEmailDto {
    private String email;
    private Boolean primary;
    private Boolean verified;
    private String visibility;
}
