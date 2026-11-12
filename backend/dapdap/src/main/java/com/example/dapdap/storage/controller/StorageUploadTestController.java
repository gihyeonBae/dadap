package com.example.dapdap.storage.controller;

import com.example.dapdap.global.response.GlobalApiResponse;
import com.example.dapdap.storage.dto.S3UploadResponse;
import com.example.dapdap.storage.service.S3KeyFactory;
import com.example.dapdap.storage.service.S3UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/storage/test")
public class StorageUploadTestController {

    private final S3UploadService uploadService;
    private final S3KeyFactory keyFactory;

    @PostMapping("/upload-video")
    public GlobalApiResponse<S3UploadResponse> uploadVideo(
            @RequestParam long interviewId,
            @RequestParam int turnIndex,
            @RequestPart MultipartFile videoFile
    ) {
        String key = keyFactory.interviewVideoKey(interviewId, turnIndex);
        return GlobalApiResponse.ok(uploadService.upload(videoFile, key));
    }

    @PostMapping("/upload-audio")
    public GlobalApiResponse<S3UploadResponse> uploadAudio(
            @RequestParam long interviewId,
            @RequestParam int turnIndex,
            @RequestPart MultipartFile audioFile
    ) {
        String key = keyFactory.interviewAudioKey(interviewId, turnIndex);
        return GlobalApiResponse.ok(uploadService.upload(audioFile, key));
    }
}
