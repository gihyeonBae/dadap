package com.example.dapdap.ai.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.ai")
public class AiProperties {

    private String baseUrl;

    // 기존
    private String analyzePath = "/analyze";

    // 신규: AI 서버에 엔드포인트가 있으면 사용, 없으면 analyzePath로 fallback
    private String analyzeAudioPath = "/analyze/audio";
    private String analyzeVideoPath = "/analyze/video";
    private String analyzeResumePath = "/resume"; // 서류 면접 전용 엔드포인트 추가

    private long connectTimeoutMillis = 2000;
    private long responseTimeoutMillis = 15000;

    private boolean mock = false;

    private String reportPath = "/report";
}
