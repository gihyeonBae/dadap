package com.example.dapdap.global.response;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class GlobalApiResponse<T> {

    private final int status;
    private final String message;
    private final T data;

    private GlobalApiResponse(int status, String message, T data) {
        this.status = status;
        this.message = message;
        this.data = data;
    }

    public static <T> GlobalApiResponse<T> of(HttpStatus httpStatus, String message, T data) {
        return new GlobalApiResponse<>(httpStatus.value(), message, data);
    }

    // ============================
    // Success
    // ============================
    public static <T> GlobalApiResponse<T> ok(T data) {
        return of(HttpStatus.OK, "OK", data);
    }

    public static <T> GlobalApiResponse<T> ok(String message, T data) {
        return of(HttpStatus.OK, message, data);
    }

    public static <T> GlobalApiResponse<T> created(String message, T data) {
        return of(HttpStatus.CREATED, message, data);
    }

    public static GlobalApiResponse<Void> noContent(String message) {
        return of(HttpStatus.NO_CONTENT, message, null);
    }

    // ============================
    // Fail
    // ============================
    public static GlobalApiResponse<Void> fail(HttpStatus httpStatus, String message) {
        return of(httpStatus, message, null);
    }
}
