package com.example.dapdap.storage.service;

import com.example.dapdap.storage.dto.S3UploadResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class S3UploadService {

    private final S3Client s3Client;

    @Value("${app.s3.bucket}")
    private String bucket;

    /**
     * MultipartFile??S3???낅줈?쒗븯怨? ?낅줈?쒕맂 key瑜?諛섑솚?쒕떎.
     */
    public S3UploadResponse upload(MultipartFile file, String key) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("?낅줈???뚯씪??鍮꾩뼱?덉뒿?덈떎.");
        }

        String contentType = file.getContentType();
        long size = file.getSize();

        PutObjectRequest put = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType)
                .build();

        try {
            s3Client.putObject(
                    put,
                    RequestBody.fromInputStream(file.getInputStream(), size)
            );
        } catch (IOException e) {
            throw new IllegalStateException("S3 ?낅줈??以??뚯씪 ?ㅽ듃由?泥섎━ ?ㅽ뙣", e);
        }

        return new S3UploadResponse(key, size, contentType);
    }

    public void deleteByKey(String key) {
        if (key == null || key.isBlank()) {
            return;
        }

        DeleteObjectRequest req = DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();
        s3Client.deleteObject(req);
    }
}
