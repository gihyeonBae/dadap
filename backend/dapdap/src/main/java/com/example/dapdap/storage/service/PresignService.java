package com.example.dapdap.storage.service;

import com.example.dapdap.storage.dto.PresignDownloadResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class PresignService {

    private final S3Presigner presigner;

    @Value("${app.s3.bucket}")
    private String bucket;

    @Value("${app.s3.presign.download-expire-seconds}")
    private long downloadExpireSeconds;

    /**
     * Private S3 객체에 대한 다운로드/재생 URL(Presigned GET)을 발급한다.
     * - URL은 만료되므로 DB에 영구 저장하지 않는다.
     */
    public PresignDownloadResponse presignDownload(String key) {
        GetObjectRequest get = GetObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();

        GetObjectPresignRequest req = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofSeconds(downloadExpireSeconds))
                .getObjectRequest(get)
                .build();

        PresignedGetObjectRequest signed = presigner.presignGetObject(req);
        return new PresignDownloadResponse(key, signed.url().toString(), downloadExpireSeconds);
    }
}
