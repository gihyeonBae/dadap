package com.example.dapdap.storage.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
public class S3Config {

    @Bean
    public Region awsRegion(@Value("${app.s3.region}") String region) {
        return Region.of(region);
    }

    /**
     * 서버가 S3에 직접 업로드할 때 사용하는 클라이언트
     */
    @Bean
    public S3Client s3Client(Region region) {
        return S3Client.builder()
                .region(region)
                .build();
    }

    /**
     * Private S3 객체를 사용자가 재생/다운로드할 수 있도록
     * 임시 접근 URL(Presigned GET)을 발급할 때 사용하는 객체
     */
    @Bean
    public S3Presigner s3Presigner(Region region) {
        return S3Presigner.builder()
                .region(region)
                .build();
    }
}
