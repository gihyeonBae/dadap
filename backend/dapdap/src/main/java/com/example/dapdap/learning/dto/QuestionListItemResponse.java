package com.example.dapdap.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionListItemResponse {
    Long questionId;
    String title;
    int difficulty;
    Long parentId;

    Long categoryId;
    private String categoryName;
    long views;
}
