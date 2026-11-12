package com.example.dapdap.auth.domain;

public enum UserStatus {

    ACTIVE(1),
    INACTIVE(0),
    BANNED(2);

    private final int value;

    UserStatus(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}

