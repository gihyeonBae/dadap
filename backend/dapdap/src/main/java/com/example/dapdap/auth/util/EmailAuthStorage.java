package com.example.dapdap.auth.util;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class EmailAuthStorage {

    private static class CodeInfo {
        String code;
        long expireAt;

        CodeInfo(String code, long expireAt) {
            this.code = code;
            this.expireAt = expireAt;
        }
    }

    private final Map<String, CodeInfo> storage = new ConcurrentHashMap<>();

    // 저장 (5분 만료)
    public void save(String email, String code) {
        long expire = System.currentTimeMillis() + 5 * 60 * 1000; // 5분
        storage.put(email, new CodeInfo(code, expire));
    }

    public String get(String email) {
        CodeInfo info = storage.get(email);
        if (info == null) return null;

        if (System.currentTimeMillis() > info.expireAt) {
            storage.remove(email);
            return null; // 만료됨
        }
        return info.code;
    }

    public void delete(String email) {
        storage.remove(email);
    }
}