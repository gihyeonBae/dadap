package com.example.dapdap.interview.service;

import com.example.dapdap.interview.dto.request.InterviewCreateRequest;
import com.example.dapdap.interview.dto.response.InterviewCreateResponse;
import com.example.dapdap.interview.dto.response.InterviewTitleResponse;
import com.example.dapdap.interview.dto.response.NextQuestionResponse;
import com.example.dapdap.interview.entity.*;
import com.example.dapdap.interview.repository.InterviewRepository;
import com.example.dapdap.interview.repository.InterviewTurnRepository;
import com.example.dapdap.learning.repository.QuestionKeywordRepository;
import com.example.dapdap.portfolio.entity.PortfolioQuestion;
import com.example.dapdap.portfolio.repository.PortfolioQuestionRepository;
import com.example.dapdap.question.entity.Category;
import com.example.dapdap.question.entity.Question;
import com.example.dapdap.question.repository.CategoryRepository;
import com.example.dapdap.question.repository.QuestionRepository;
import com.example.dapdap.users.entity.User;
import com.example.dapdap.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final InterviewTurnRepository turnRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final QuestionRepository questionRepository;
    private final PortfolioQuestionRepository portfolioQuestionRepository; // 포트폴리오 질문 리포지토리
    private final QuestionKeywordRepository questionKeywordRepository;

    @Transactional
    public InterviewCreateResponse createInterview(Long userId, InterviewCreateRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. userId=" + userId));

        int targetCount = (req.getTargetQuestionCount() == null || req.getTargetQuestionCount() <= 0)
                ? 5
                : req.getTargetQuestionCount();

        Category category = null;
        if (req.getInterviewType() == InterviewType.CS) {
            if (req.getCategoryId() == null) {
                throw new IllegalArgumentException("CS 면접은 categoryId가 필요합니다.");
            }
            category = categoryRepository.findById(req.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다. categoryId=" + req.getCategoryId()));
        } else {
            if (req.getPortfolioId() == null) {
                throw new IllegalArgumentException("PORTFOLIO 면접은 portfolioId가 필요합니다.");
            }
        }

        Interview interview = Interview.builder()
                .user(user)
                .portfolioId(req.getPortfolioId())
                .interviewType(req.getInterviewType())
                .runMode(req.getRunMode())
                .category(category)
                .status(InterviewStatus.IN_PROGRESS)
                .targetQuestionCount(targetCount)
                .askedCount(0)
                .optionJson(req.getOptionJson())
                .build();

        Interview saved = interviewRepository.save(interview);

        return new InterviewCreateResponse(saved.getId());
    }

    @Transactional
    public NextQuestionResponse nextQuestion(Long userId, Long interviewId) {
        Interview interview = interviewRepository.findByIdAndUser_IdAndDeletedAtIsNull(interviewId, userId)
                .orElseThrow(() -> new IllegalArgumentException("면접을 찾을 수 없습니다. interviewId=" + interviewId));

        if (interview.getStatus() != InterviewStatus.IN_PROGRESS) {
            throw new IllegalArgumentException("진행 중인 면접이 아닙니다. status=" + interview.getStatus());
        }

        interview.startIfNeeded();

        if (interview.isFinishedByCount()) {
            return new NextQuestionResponse(interviewId, null, interview.getAskedCount(), null, false, null, List.of());
        }

        int nextIndex = interview.getAskedCount() + 1;
        InterviewTurn turn;
        List<String> keywords = List.of();

        if (interview.getInterviewType() == InterviewType.CS) {
            // CS 면접 로직
            long categoryId = interview.getCategory().getId();
            List<Long> usedIds = turnRepository.findUsedQuestionIds(interviewId);

            Question picked = usedIds.isEmpty()
                    ? questionRepository.findRandomMainByCategory(categoryId)
                    .orElseThrow(() -> new IllegalArgumentException("해당 카테고리에서 질문을 찾을 수 없습니다. categoryId=" + categoryId))
                    : questionRepository.findRandomMainByCategoryExclude(categoryId, usedIds)
                    .orElseThrow(() -> new IllegalArgumentException("사용 가능한 질문이 더 이상 없습니다. categoryId=" + categoryId));

            keywords = getQuestionKeywords(picked.getId());

            turn = InterviewTurn.builder()
                    .interview(interview)
                    .turnIndex(nextIndex)
                    .followUp(false)
                    .parentTurn(null)
                    .question(picked) // CS 질문 선정
                    .portfolioQuestion(null)
                    .questionText(picked.getContent())
                    .analysisStatus(AnalysisStatus.PENDING)
                    .build();

        } else {
            // 포트폴리오 면접 로직
            Long portfolioId = interview.getPortfolioId();
            if (portfolioId == null) {
                throw new IllegalStateException("포트폴리오 면접인데 portfolioId가 설정되어 있지 않습니다.");
            }
            List<Long> usedIds = turnRepository.findUsedPortfolioQuestionIds(interviewId);

                PortfolioQuestion picked = usedIds.isEmpty()
                    ? portfolioQuestionRepository.findRandomMainByPortfolio(portfolioId)
                    .orElseThrow(() -> new IllegalArgumentException("해당 포트폴리오에서 질문을 찾을 수 없습니다. portfolioId=" + portfolioId))
                    : portfolioQuestionRepository.findRandomMainByPortfolioExclude(portfolioId, usedIds)
                    .orElseThrow(() -> new IllegalArgumentException("사용 가능한 질문이 더 이상 없습니다. portfolioId=" + portfolioId));
                // 포트폴리오 질문의 topic/intent를 keywords로 채움
                List<String> kw = new ArrayList<>();
                if (picked.getTopic() != null && !picked.getTopic().isBlank()) kw.add(picked.getTopic());
                if (picked.getIntent() != null && !picked.getIntent().isBlank()) kw.add(picked.getIntent());

                turn = InterviewTurn.builder()
                    .interview(interview)
                    .turnIndex(nextIndex)
                    .followUp(false)
                    .parentTurn(null)
                    .question(null)
                    .portfolioQuestion(picked) // 포트폴리오 질문 선정
                    .questionText(picked.getContent())
                    .analysisStatus(AnalysisStatus.PENDING)
                    .build();

                if (!kw.isEmpty()) {
                keywords = kw;
                }
        }

                InterviewTurn savedTurn = turnRepository.save(turn);

        return new NextQuestionResponse(
                interviewId,
                savedTurn.getId(),
                nextIndex,
                savedTurn.getQuestionText(),
                false,
                null,
                keywords
        );
    }

    @Transactional
    public InterviewTitleResponse updateTitle(Long userId, Long interviewId, String title) {
        Interview interview = interviewRepository.findByIdAndUser_IdAndDeletedAtIsNull(interviewId, userId)
                .orElseThrow(() -> new IllegalArgumentException("면접을 찾을 수 없습니다. interviewId=" + interviewId));

        if (interview.getStatus() != InterviewStatus.FINISHED) {
            throw new IllegalArgumentException("면접 종료 이후에는 title을 변경할 수 없습니다.");
        }

        interview.updateTitle(title);
        return new InterviewTitleResponse(interview.getId(), interview.getTitle());
    }

    @Transactional
    public void deleteInterview(Long userId, Long interviewId) {
        Interview interview = interviewRepository.findByIdAndUser_IdAndDeletedAtIsNull(interviewId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Interview not found. interviewId=" + interviewId));
        interview.softDelete();
    }

    private List<String> getQuestionKeywords(Long questionId) {
        if (questionId == null) {
            return List.of();
        }
        return questionKeywordRepository.findKeywordsByQuestionId(questionId);
    }
}


