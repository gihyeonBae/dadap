package com.example.dapdap.users.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateMeRequest {

    @Size(min = 2, max = 20, message = "nickname must be 2-20 characters.")
    private String nickname;

    private String jobTitle;

    @Size(max = 100, message = "bio must be 0-100 characters.")
    private String bio;
}
