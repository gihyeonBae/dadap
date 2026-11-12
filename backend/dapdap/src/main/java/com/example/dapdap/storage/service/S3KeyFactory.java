package com.example.dapdap.storage.service;

import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class S3KeyFactory {

    public String interviewVideoKey(long interviewId, int turnIndex) {
        return "interviews/" + interviewId + "/turn-" + turnIndex + "/video-" + UUID.randomUUID() + ".webm";
    }

    public String interviewAudioKey(long interviewId, int turnIndex) {
        return "interviews/" + interviewId + "/turn-" + turnIndex + "/audio-" + UUID.randomUUID() + ".webm";
    }

    public String portfolioKey(long userId, String originalFilename) {
        return "portfolios/user-" + userId + "/" + UUID.randomUUID() + "-" + sanitize(originalFilename);
    }

    public String profileImageKey(long userId, String extension, String uuid) {
        String safeExt = (extension == null || extension.isBlank()) ? "png" : extension.toLowerCase();
        return "users/" + userId + "/profile/" + uuid + "." + safeExt;
    }

    public String boardImageKey(long userId, long boardId, String originalFilename) {
        return "boards/user-" + userId + "/post-" + boardId + "/" + UUID.randomUUID() + "-" + sanitize(originalFilename);
    }

    private String sanitize(String name) {
        if (name == null || name.isBlank()) return "file";
        return name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    public String portfolioKey(Long userId, String originalFilename) {
        String uuid = UUID.randomUUID().toString();

        // [수정됨] null 방지
        if (originalFilename == null || originalFilename.isBlank()) {
            originalFilename = "portfolio";
        }

        // 공백(\s), 괄호, 더하기(+) 기호를 모두 언더스코어(_)로 치환
        // 예: "직무기술서(정보화 지원실).pdf" -> "직무기술서_정보화_지원실_.pdf"
        String safeFilename = originalFilename.replaceAll("[\\s\\(\\)\\+]", "_");

        return String.format("portfolios/%d/%s_%s", userId, uuid, safeFilename);
    }
}
