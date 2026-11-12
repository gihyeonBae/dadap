package com.example.dapdap.users.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class NicknameAvailabilityResponse {
    private final boolean available;
}
