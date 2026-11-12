package com.example.dapdap.auth.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum Role {
    USER("ROLE_USER"),
    ADMIN("ROLE_ADMIN");

    private final String authority;

    // GrantedAuthority를 구현하는 데 필요할 수 있음
    public String getAuthority() {
        return authority;
    }
}