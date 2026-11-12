package com.example.dapdap.interview.controller;

import com.example.dapdap.auth.domain.CustomUserDetails;
import com.example.dapdap.interview.dto.response.StreakResponse;
import com.example.dapdap.interview.service.InterviewStreakService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewStreakController {
    private final InterviewStreakService streakService;

    @GetMapping("/me/streak")
    public StreakResponse getMyStreak(@AuthenticationPrincipal CustomUserDetails userDetails){
        long userId = userDetails.getUser().getId();
        return streakService.getCurrentStreak(userId);
    }
}
