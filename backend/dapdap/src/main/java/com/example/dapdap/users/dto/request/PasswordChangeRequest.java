package com.example.dapdap.users.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordChangeRequest {

    @NotBlank(message = "currentPassword is required.")
    private String currentPassword;

    @NotBlank(message = "newPassword is required.")
    private String newPassword;

    @NotBlank(message = "confirmPassword is required.")
    private String confirmPassword;
}
