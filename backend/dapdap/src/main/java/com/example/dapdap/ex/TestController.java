package com.example.dapdap.ex;

import com.example.dapdap.global.exception.CustomException;
import com.example.dapdap.global.exception.ErrorCode;
import com.example.dapdap.global.response.GlobalApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    // 1) 성공 - 기본 OK
    @GetMapping("/success")
    public GlobalApiResponse<Map<String, Object>> success() {
        Map<String, Object> data = Map.of(
                "id", 1,
                "name", "dapdap",
                "active", true
        );
        return GlobalApiResponse.ok(data);
    }

    // 2) 성공 - 메시지 커스텀 OK
    @GetMapping("/success-message")
    public GlobalApiResponse<Map<String, String>> successWithMessage() {
        return GlobalApiResponse.ok("조회 성공", Map.of("key", "value"));
    }

    // 3) 생성 - 201 Created (ResponseEntity로 HTTP 상태도 맞춤)
    @PostMapping("/created")
    public ResponseEntity<GlobalApiResponse<Map<String, Object>>> created() {
        Map<String, Object> data = Map.of("userId", 1001);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(GlobalApiResponse.created("생성 완료", data));
    }

    // 4) 삭제 - 204 No Content (data 없음)
    @DeleteMapping("/no-content")
    public ResponseEntity<GlobalApiResponse<Void>> noContent() {
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .body(GlobalApiResponse.noContent("삭제 완료"));
    }

    // 5) 400 - IllegalArgumentException (간단한 요청 오류)
    @GetMapping("/bad-request")
    public void badRequest() {
        throw new IllegalArgumentException("요청 파라미터가 올바르지 않습니다.");
    }

    // 6) 404 - CustomException (리소스 없음)
    @GetMapping("/not-found")
    public void notFound() {
        throw new CustomException(ErrorCode.NOT_FOUND, "해당 사용자를 찾을 수 없습니다.");
    }

    // 7) 409 - CustomException (중복)
    @GetMapping("/conflict")
    public void conflict() {
        throw new CustomException(ErrorCode.CONFLICT, "이미 등록된 이메일입니다.");
    }

    // 8) 422 - Validation 실패 (@Valid)
    @PostMapping("/validation")
    public GlobalApiResponse<Map<String, String>> validation(@RequestBody @Valid TestCreateUserRequest req) {
        // 검증 통과 시 정상 응답
        return GlobalApiResponse.ok("검증 통과", Map.of("email", req.getEmail(), "nickname", req.getNickname()));
    }

    // 9) 400 - 타입 미스매치 (예: /api/test/type-mismatch/abc)
    @GetMapping("/type-mismatch/{id}")
    public GlobalApiResponse<Map<String, Object>> typeMismatch(@PathVariable Long id) {
        return GlobalApiResponse.ok(Map.of("id", id));
    }

    // 10) 500 - 예상치 못한 오류
    @GetMapping("/server-error")
    public GlobalApiResponse<String> serverError() {
        // NullPointerException 유도
        String s = null;
        return GlobalApiResponse.ok(s.toString());
    }
}
