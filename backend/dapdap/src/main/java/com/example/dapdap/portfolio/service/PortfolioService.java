package com.example.dapdap.portfolio.service;

import com.example.dapdap.portfolio.dto.AiAnalysisResponse;
import com.example.dapdap.portfolio.dto.PortfolioQuestionResponse;
import com.example.dapdap.portfolio.dto.PortfolioResponse;
import com.example.dapdap.portfolio.entity.Portfolio;
import com.example.dapdap.portfolio.entity.PortfolioQuestion;
import com.example.dapdap.portfolio.entity.PortfolioType;
import com.example.dapdap.portfolio.repository.PortfolioQuestionRepository;
import com.example.dapdap.portfolio.repository.PortfolioRepository;
import com.example.dapdap.storage.dto.PresignDownloadResponse;
import com.example.dapdap.storage.dto.S3UploadResponse;
import com.example.dapdap.storage.service.PresignService;
import com.example.dapdap.storage.service.S3KeyFactory;
import com.example.dapdap.storage.service.S3UploadService;
import com.example.dapdap.users.entity.User;
import com.example.dapdap.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final PortfolioQuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    // Storage 관련 서비스
    private final S3UploadService s3UploadService;
    private final S3KeyFactory s3KeyFactory;
    private final PresignService presignService;

    @Value("${app.ai.base-url}")
    private String aiBaseUrl;

    @Value("${app.s3.bucket}")
    private String s3Bucket;

    @Value("${app.s3.region}")
    private String s3Region;

    /**
     * [통합 메서드] 파일 업로드 -> DB 저장 -> AI 분석 요청
     */
    @Transactional
    public Long uploadAndAnalyze(MultipartFile file, Long userId, PortfolioType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 없습니다. id=" + userId));

        // 1. S3 Key 생성
        String s3Key = s3KeyFactory.portfolioKey(userId, file.getOriginalFilename());

        // 2. S3 업로드
        s3UploadService.upload(file, s3Key);

        // 3. AI 서버용 Presigned URL 생성 (다운로드용)
        PresignDownloadResponse downloadResponse = presignService.presignDownload(s3Key);
        String presignedUrl = downloadResponse.getUrl();

        // 4. Portfolio 엔티티 저장
        String originalFileUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", s3Bucket, s3Region, s3Key);

        Portfolio portfolio = Portfolio.builder()
                .user(user)
                .title(file.getOriginalFilename()) // 제목은 파일명으로 설정
                .type(type)                        // 문서 타입 (PORTFOLIO or RESUME)
                .fileKey(s3Key)
                .fileUrl(originalFileUrl)
                .originalFilename(file.getOriginalFilename())
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .build();

        Portfolio savedPortfolio = portfolioRepository.save(portfolio);

        // 5. AI 분석 요청 (Presigned URL 전달)
        analyzePortfolio(savedPortfolio.getId(), presignedUrl);

        return savedPortfolio.getId();
    }

    /**
     * AI 서버에 분석 요청 및 결과 저장 (내부 로직)
     */
    @Transactional
    public void analyzePortfolio(Long portfolioId, String downloadUrl) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new IllegalArgumentException("해당 포트폴리오가 없습니다. id=" + portfolioId));

        String requestUrl = aiBaseUrl + "/api/v1/portfolio/generate-questions";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("url", downloadUrl);
        requestBody.put("portfolio_id", portfolioId);

        log.info("🤖 AI 분석 요청 시작: {} (Portfolio ID: {})", requestUrl, portfolioId);

        // AI 서버 호출 (타임아웃은 RestTemplateConfig 설정 따름)
        AiAnalysisResponse response = restTemplate.postForObject(
                requestUrl, requestBody, AiAnalysisResponse.class
        );

        if (response == null || response.getQuestions() == null || response.getQuestions().isEmpty()) {
            log.error("❌ AI 분석 실패 또는 빈 응답 수신 (Portfolio ID: {})", portfolioId);
            return;
        }

        // 응답 데이터 DB 저장 (재귀)
        for (AiAnalysisResponse.AiQuestionDto rootQuestionDto : response.getQuestions()) {
            saveQuestionRecursive(rootQuestionDto, null, portfolio, 0);
        }

        log.info("✅ 분석 완료 및 질문 저장 성공 (Portfolio ID: {})", portfolioId);
    }

    /**
     * 재귀적으로 질문을 저장하는 메서드
     */
    private void saveQuestionRecursive(AiAnalysisResponse.AiQuestionDto dto,
                                       PortfolioQuestion parent,
                                       Portfolio portfolio,
                                       int depth) {

        PortfolioQuestion question = PortfolioQuestion.builder()
                .content(dto.getQuestionContent())
                .intent(dto.getIntent())
                .topic(dto.getTopic())
                .depth(depth)
                .portfolio(portfolio)
                .parent(parent)
                .build();

        if (parent != null) {
            parent.addChild(question);
        } else {
            questionRepository.save(question);
        }

        if (dto.getTailQuestions() != null && !dto.getTailQuestions().isEmpty()) {
            for (AiAnalysisResponse.AiQuestionDto tailDto : dto.getTailQuestions()) {
                saveQuestionRecursive(tailDto, question, portfolio, depth + 1);
            }
        }
    }

    /**
     * 포트폴리오 질문 상세 조회
     */
    @Transactional(readOnly = true)
    public List<PortfolioQuestionResponse> getPortfolioQuestions(Long portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new IllegalArgumentException("해당 포트폴리오가 없습니다. id=" + portfolioId));

        return portfolio.getQuestions().stream()
                .filter(q -> q.getParent() == null) // 메인 질문만 필터링
                .map(PortfolioQuestionResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 내 포트폴리오 목록 조회 (타입 필터링 지원)
     */
    @Transactional(readOnly = true)
    public List<PortfolioResponse> getMyPortfolios(Long userId, String typeStr) {
        List<Portfolio> portfolios;

        if (typeStr != null && !typeStr.isEmpty()) {
            try {
                PortfolioType type = PortfolioType.valueOf(typeStr.toUpperCase());
                portfolios = portfolioRepository.findAllByUserIdAndTypeOrderByCreatedAtDesc(userId, type);
            } catch (IllegalArgumentException e) {
                portfolios = portfolioRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
            }
        } else {
            portfolios = portfolioRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
        }

        return portfolios.stream()
                .map(PortfolioResponse::from)
                .collect(Collectors.toList());
    }

    /**
     *  포트폴리오 삭제 (Soft Delete)
     * - Portfolio 엔티티에 @SQLDelete가 적용되어 있어, 실제로는 UPDATE 쿼리가 나갑니다.
     * - CascadeType.ALL 설정으로 인해 연관된 질문들도 함께 Soft Delete 됩니다.
     */
    @Transactional
    public void deletePortfolio(Long portfolioId, Long userId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new IllegalArgumentException("해당 포트폴리오가 없습니다. id=" + portfolioId));

        // 본인 확인
        if (!portfolio.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("본인의 포트폴리오만 삭제할 수 있습니다.");
        }

        // 삭제 수행 (실제로는 Soft Delete Update 쿼리 실행)
        portfolioRepository.delete(portfolio);
    }
}