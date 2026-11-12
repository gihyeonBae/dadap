package com.example.dapdap.auth.service;

import com.example.dapdap.auth.dto.GithubAccessTokenDto;
import com.example.dapdap.auth.dto.GithubEmailDto;
import com.example.dapdap.auth.dto.GithubProfileDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.util.Arrays;

@Service
public class GithubOauthService {
    @Value("${oauth.github.client-id}")
    private String githubClientId;

    @Value("${oauth.github.client-secret}")
    private String githubClientSecret;

    @Value("${oauth.github.redirect-uri}")
    private String githubRedirectUri;

    public GithubAccessTokenDto getAccessToken(String code){
        RestClient restClient = RestClient.create();
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", githubClientId);
        params.add("client_secret", githubClientSecret);
        params.add("redirect_uri", githubRedirectUri);

        ResponseEntity<GithubAccessTokenDto> response = restClient.post()
                .uri("https://github.com/login/oauth/access_token")
                .header("Accept", "application/json")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .body(params)
                .retrieve()
                .toEntity(GithubAccessTokenDto.class);

        System.out.println("응답 accesstoken JSON " + response.getBody());
        return response.getBody();
    }

    public GithubProfileDto getGithubProfile(String token){
        RestClient restClient = RestClient.create();

        ResponseEntity<GithubProfileDto> response = restClient.get()
                .uri("https://api.github.com/user")
                .header("Authorization", "Bearer " + token)
                // GitHub API는 User-Agent 헤더 요구하는 경우가 있어서 넣는 게 안전함
                .header("User-Agent", "oauth-app")
                .header("Accept", "application/vnd.github+json")
                .retrieve()
                .toEntity(GithubProfileDto.class);

        System.out.println("profile JSON " + response.getBody());
        return response.getBody();
    }

    public String getPrimaryEmail(String token) {
        RestClient restClient = RestClient.create();

        ResponseEntity<GithubEmailDto[]> response = restClient.get()
                .uri("https://api.github.com/user/emails")
                .header("Authorization", "Bearer " + token)
                .header("User-Agent", "oauth-app")
                .header("Accept", "application/vnd.github+json")
                .retrieve()
                .toEntity(GithubEmailDto[].class);

        GithubEmailDto[] emails = response.getBody();
        if (emails == null) return null;

        return Arrays.stream(emails)
                .filter(e -> Boolean.TRUE.equals(e.getPrimary()))
                .map(GithubEmailDto::getEmail)
                .findFirst()
                .orElse(null);
    }
}
