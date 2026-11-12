package com.example.dapdap.storage.controller;

import com.example.dapdap.global.response.GlobalApiResponse;
import com.example.dapdap.storage.dto.PresignDownloadRequest;
import com.example.dapdap.storage.dto.PresignDownloadResponse;
import com.example.dapdap.storage.service.PresignService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/storage/test")
public class StoragePresignController {

    private final PresignService presignService;

    @PostMapping("/presign-download")
    public GlobalApiResponse<PresignDownloadResponse> presignDownload(@RequestBody PresignDownloadRequest req) {
        return GlobalApiResponse.ok(presignService.presignDownload(req.getKey()));
    }
}
