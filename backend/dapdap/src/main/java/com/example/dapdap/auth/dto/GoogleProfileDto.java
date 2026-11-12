package com.example.dapdap.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleProfileDto {
    private String sub;
    private String email;
    private String picture;
    private String name;
}
