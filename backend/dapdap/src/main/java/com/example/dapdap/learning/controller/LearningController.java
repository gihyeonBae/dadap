package com.example.dapdap.learning.controller;

import com.example.dapdap.auth.domain.CustomUserDetails;
import com.example.dapdap.global.response.GlobalApiResponse;
import com.example.dapdap.learning.dto.PageResponse;
import com.example.dapdap.learning.dto.QuestionDetailResponse;
import com.example.dapdap.learning.dto.QuestionListItemResponse;
import com.example.dapdap.learning.service.LearningService;
import com.example.dapdap.users.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/learning")
@RequiredArgsConstructor
public class LearningController {
    private final LearningService learningService;

    @GetMapping("/questions")
    public PageResponse<QuestionListItemResponse> getQuestions(@RequestParam(required = false) Long categoryId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size){
        return learningService.getQuestionByCategory(categoryId, page, size);
    }

    @GetMapping("/questions/{questionId}")
    public QuestionDetailResponse getQuestionDetail(@PathVariable Long questionId){
        return learningService.getQuestionDetail(questionId);
    }

    @PostMapping("/questions/{questionId}/scrap")
    public GlobalApiResponse<Void> scrap(
            @PathVariable Long questionId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User user = userDetails.getUser();
        learningService.scrap(questionId, user.getId());
        return GlobalApiResponse.ok(null);
    }

    @DeleteMapping("/questions/{questionId}/scrap")
    public GlobalApiResponse<Void> unscrap(
            @PathVariable Long questionId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User user = userDetails.getUser();
        learningService.unscrap(questionId, user.getId());
        return GlobalApiResponse.ok(null);
    }

    @GetMapping("/questions/scrap")
    public PageResponse<QuestionListItemResponse> getScrappedQuestions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ){
        User user = userDetails.getUser();
        return learningService.getScrappedQuestions(user.getId(), page, size);
    }
}
