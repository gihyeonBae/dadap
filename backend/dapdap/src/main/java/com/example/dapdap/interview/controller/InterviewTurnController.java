package com.example.dapdap.interview.controller;

import com.example.dapdap.auth.domain.CustomUserDetails;
import com.example.dapdap.global.response.GlobalApiResponse;
import com.example.dapdap.interview.dto.response.TurnMediaUploadResponse;
import com.example.dapdap.interview.service.InterviewTurnService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/interviews")
public class InterviewTurnController {

    private final InterviewTurnService interviewTurnService;

    @PostMapping("/{interviewId}/turns/{turnId}/upload-audio")
    public GlobalApiResponse<TurnMediaUploadResponse> uploadAudio(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long interviewId,
            @PathVariable Long turnId,
            @RequestPart MultipartFile audioFile
    ) {
        Long userId = userDetails.getUser().getId();
        return GlobalApiResponse.ok(
                "오디오 업로드가 완료되었습니다.",
                interviewTurnService.uploadAudio(userId, interviewId, turnId, audioFile)
        );
    }

    @PostMapping("/{interviewId}/turns/{turnId}/upload-video")
    public GlobalApiResponse<TurnMediaUploadResponse> uploadVideo(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long interviewId,
            @PathVariable Long turnId,
            @RequestPart MultipartFile videoFile
    ) {
        Long userId = userDetails.getUser().getId();
        return GlobalApiResponse.ok(
                "비디오 업로드가 완료되었습니다.",
                interviewTurnService.uploadVideo(userId, interviewId, turnId, videoFile)
        );
    }
}
