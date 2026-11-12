package com.example.dapdap.portfolio.controller;

import com.example.dapdap.portfolio.dto.PortfolioQuestionResponse;
import com.example.dapdap.portfolio.dto.PortfolioResponse;
import com.example.dapdap.portfolio.entity.PortfolioType;
import com.example.dapdap.portfolio.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/portfolios")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    /**
     * 1. [POST] 포트폴리오 업로드 및 AI 분석 요청
     * - Body: file, userId, type ("PORTFOLIO" or "RESUME")
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadAndAnalyze(
            @RequestPart(value = "file") MultipartFile file,
            @RequestPart(value = "userId") String userIdStr,
            @RequestPart(value = "type") String typeStr
    ) {
        Long userId = Long.parseLong(userIdStr);

        PortfolioType type;
        try {
            type = PortfolioType.valueOf(typeStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("유효하지 않은 문서 타입입니다. (PORTFOLIO 또는 RESUME)");
        }

        Long portfolioId = portfolioService.uploadAndAnalyze(file, userId, type);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "분석이 완료되었습니다.");
        response.put("portfolioId", portfolioId);

        return ResponseEntity.ok(response);
    }

    /**
     * 2. [GET] 내 포트폴리오 목록 조회
     * - Params: userId (필수), type (선택)
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getMyPortfolios(
            @RequestParam Long userId,
            @RequestParam(required = false) String type
    ) {
        List<PortfolioResponse> portfolios = portfolioService.getMyPortfolios(userId, type);

        Map<String, Object> response = new HashMap<>();
        response.put("count", portfolios.size());
        response.put("portfolios", portfolios);

        return ResponseEntity.ok(response);
    }

    /**
     * 3. [GET] 포트폴리오 질문 목록 상세 조회
     */
    @GetMapping("/{portfolioId}/questions")
    public ResponseEntity<Map<String, Object>> getPortfolioQuestions(@PathVariable Long portfolioId) {
        List<PortfolioQuestionResponse> questions = portfolioService.getPortfolioQuestions(portfolioId);

        Map<String, Object> response = new HashMap<>();
        response.put("portfolioId", portfolioId);
        response.put("count", questions.size());
        response.put("questions", questions);

        return ResponseEntity.ok(response);
    }

    /**
     * 4. [DELETE] 포트폴리오 삭제 (Soft Delete)
     * - Params: userId (본인 확인용, 실제로는 토큰 사용 권장)
     */
    @DeleteMapping("/{portfolioId}")
    public ResponseEntity<Map<String, Object>> deletePortfolio(
            @PathVariable Long portfolioId,
            @RequestParam Long userId
    ) {
        portfolioService.deletePortfolio(portfolioId, userId);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "포트폴리오가 성공적으로 삭제되었습니다.");
        response.put("portfolioId", portfolioId);

        return ResponseEntity.ok(response);
    }
}