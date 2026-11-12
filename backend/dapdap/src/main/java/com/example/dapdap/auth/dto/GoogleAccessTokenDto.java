package com.example.dapdap.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GoogleAccessTokenDto {
    private String access_token;
    private String expires_in;
    private String scope;
    private String id_token;
}
