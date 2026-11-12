package com.example.dapdap.interview.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class InterviewTitleUpdateRequest {
    @NotBlank
    private String title;
}
