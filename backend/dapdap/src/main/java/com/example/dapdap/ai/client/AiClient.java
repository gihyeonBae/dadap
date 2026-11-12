package com.example.dapdap.ai.client;

import com.example.dapdap.ai.config.AiProperties;
import com.example.dapdap.ai.dto.AiReportRequest;
import com.example.dapdap.ai.dto.AiReportResponse;
import com.example.dapdap.ai.dto.external.AiAnalyzeRequestPayload;
import com.example.dapdap.ai.dto.external.AiAnalyzeResponsePayload;
import com.example.dapdap.interview.entity.InterviewType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class AiClient {

    private final WebClient aiWebClient;
    private final AiProperties props;

    public AiAnalyzeResponsePayload analyze(AiAnalyzeRequestPayload request) {
        return post(props.getAnalyzePath(), request);
    }

    public AiAnalyzeResponsePayload analyzeAudio(AiAnalyzeRequestPayload request, InterviewType interviewType) {
        String path;
        if (interviewType == InterviewType.CS) {
            path = props.getAnalyzeAudioPath();
        } else { // PORTFOLIO
            path = props.getAnalyzeResumePath();
        }
        return post(path, request);
    }

    public AiAnalyzeResponsePayload analyzeVideo(AiAnalyzeRequestPayload request) {
        return post(props.getAnalyzeVideoPath() != null ? props.getAnalyzeVideoPath() : props.getAnalyzePath(), request);
    }

    private AiAnalyzeResponsePayload post(String path, Object body) {
        return aiWebClient.post()
                .uri(path)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(AiAnalyzeResponsePayload.class)
                .block();
    }

    public AiReportResponse generateReport(AiReportRequest request) {
        return aiWebClient.post()
                .uri(props.getReportPath())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(AiReportResponse.class)
                .block();
    }
}
