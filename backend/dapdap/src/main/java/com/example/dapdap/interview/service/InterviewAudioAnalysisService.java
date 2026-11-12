package com.example.dapdap.interview.service;

import com.example.dapdap.ai.dto.AiAnalyzeRequest;
import com.example.dapdap.ai.dto.AiAnalyzeResponse;
import com.example.dapdap.ai.service.AiAnalyzeService;
import com.example.dapdap.interview.dto.response.AnalyzeTurnResponse;
import com.example.dapdap.interview.dto.response.NextQuestionResponse;
import com.example.dapdap.interview.entity.*;
import com.example.dapdap.interview.repository.InterviewRepository;
import com.example.dapdap.interview.repository.InterviewTurnRepository;
import com.example.dapdap.learning.repository.QuestionKeywordRepository;
import com.example.dapdap.portfolio.entity.PortfolioQuestion;
import com.example.dapdap.portfolio.repository.PortfolioQuestionRepository;
import com.example.dapdap.question.entity.Question;
import com.example.dapdap.question.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewAudioAnalysisService {

    private final InterviewRepository interviewRepository;
    private final InterviewTurnRepository turnRepository;
    private final QuestionRepository questionRepository;
    private final PortfolioQuestionRepository portfolioQuestionRepository;
    private final QuestionKeywordRepository questionKeywordRepository;
    private final AiAnalyzeService aiAnalyzeService;
    private final InterviewService interviewService;

    @Transactional
    public AnalyzeTurnResponse analyzeAudioTurn(Long userId, Long interviewId, Long turnId) {

        Interview interview = interviewRepository.findByIdAndUser_IdAndDeletedAtIsNull(interviewId, userId)
                .orElseThrow(() -> new IllegalArgumentException("면접을 찾을 수 없습니다. interviewId=" + interviewId));

        if (interview.getStatus() != InterviewStatus.IN_PROGRESS) {
            throw new IllegalArgumentException("진행 중인 면접이 아닙니다. status=" + interview.getStatus());
        }

        InterviewTurn turn = turnRepository.findByIdAndInterview_Id(turnId, interviewId)
                .orElseThrow(() -> new IllegalArgumentException("턴을 찾을 수 없습니다. turnId=" + turnId));

        if (turn.getAudioKey() == null || turn.getAudioKey().isBlank()) {
            throw new IllegalArgumentException("분석을 위해 audioKey가 필요합니다. 먼저 오디오 업로드를 완료하세요.");
        }
        if (turn.getAnalysisStatus() == AnalysisStatus.DONE || turn.getAnalysisStatus() == AnalysisStatus.RUNNING) {
            throw new IllegalArgumentException("이미 분석 중이거나 완료된 턴입니다.");
        }

        turn.markAnalysisRunning();

        List<AiAnalyzeRequest.NextQuestionCandidate> nextQuestionCandidates =
            buildNextQuestionCandidates(turn, interview.getInterviewType());

        AiAnalyzeRequest req;
        if (interview.getInterviewType() == InterviewType.CS) {
            Question question = turn.getQuestion();
            // [?섏젙?? ?ㅻⅨ履?肄붾뱶 硫붿꽌???ъ슜
            List<String> keyTerms = collectQuestionKeyTerms(question);
            req = new AiAnalyzeRequest(
                interviewId, turnId, turn.getQuestionText(), turn.getAudioKey(), null,
                question != null ? question.getId() : null,
                question != null ? question.getModelAnswer() : null,
                keyTerms, nextQuestionCandidates
            );
        } else { // PORTFOLIO
            PortfolioQuestion question = turn.getPortfolioQuestion();

            List<String> keyTerms = new ArrayList<>();
            if (question != null) {
                if (question.getTopic() != null && !question.getTopic().isBlank()) {
                    keyTerms.add(question.getTopic());
                }
                if (question.getIntent() != null && !question.getIntent().isBlank()) {
                    // 포트폴리오에서는 intent를 CS의 키워드처럼 keyTerms에 포함합니다
                    keyTerms.add(question.getIntent());
                }
            }

            req = new AiAnalyzeRequest(
                    interviewId, turnId, turn.getQuestionText(), turn.getAudioKey(), null,
                    question != null ? question.getId() : null,
                    question != null ? question.getIntent() : null,

                    // topic + intent (가능한 경우)
                    keyTerms,

                    nextQuestionCandidates
            );
        }

        AiAnalyzeResponse aiRes;
        try {
            aiRes = aiAnalyzeService.analyzeAudio(req, interview.getInterviewType());
        } catch (Exception e) {
            log.error("AI audio analyze failed: interviewId={}, turnId={}", interviewId, turnId, e);
            turn.markAnalysisFailed();
            throw new IllegalStateException("AI 분석 실패: " + e.getMessage(), e);
        }

        turn.applyAnalysisResult(aiRes.getAnswerText(), aiRes.getFeedbackText(), aiRes.getFeedbackJson(), aiRes.getScore());
        turn.markAnalysisDone();

        interview.increaseAskedCount();
        boolean reachedTarget = interview.isFinishedByCount();
        NextQuestionResponse nextTurn = null;
        if (!reachedTarget) {
            nextTurn = createNextTurnFromAiResponse(userId, interview, aiRes);
        }
        boolean lastTurn = reachedTarget || nextTurn == null;
        boolean finished = false;
        if (lastTurn) {
            interview.finish();
            finished = true;
        }

        return new AnalyzeTurnResponse(
                finished, interviewId, turn.getId(), turn.getTurnIndex(),
                turn.getQuestionText(), turn.getAnswerText(), turn.getFeedbackText(),
                turn.isFollowUp(), nextTurn
        );
    }

    private NextQuestionResponse createNextTurnFromAiResponse(Long userId, Interview interview, AiAnalyzeResponse aiRes) {
        Long selectedQuestionId = aiRes.getSelectedQuestionId();
        String selectedQuestionText = aiRes.getSelectedQuestionText();

        if (selectedQuestionId != null && selectedQuestionId == -1L) {
            NextQuestionResponse fallback = interviewService.nextQuestion(userId, interview.getId());
            return fallback;
        }

        if (selectedQuestionId == null && (selectedQuestionText == null || selectedQuestionText.isBlank())) {
            return null; // AI媛 ?ㅼ쓬 吏덈Ц??二쇱? ?딆쓬
        }

        if (interview.isFinishedByCount()) {
            return null; // 紐⑺몴 吏덈Ц ?섎? 梨꾩슦硫??ㅼ쓬 吏덈Ц ?앹꽦 ????
        }

        int nextIndex = interview.getAskedCount() + 1;
        String nextText = selectedQuestionText;
        InterviewTurn parentTurn = turnRepository.findFirstByInterviewIdOrderByTurnIndexDesc(interview.getId()).orElse(null);

        InterviewTurn.InterviewTurnBuilder turnBuilder = InterviewTurn.builder()
                .interview(interview)
                .turnIndex(nextIndex)
                .followUp(true) // AI媛 ?앹꽦??吏덈Ц? ?꾩냽 吏덈Ц?쇰줈 媛꾩＜
                .parentTurn(parentTurn)
                .analysisStatus(AnalysisStatus.PENDING);

        List<String> keywords = List.of();

        if (interview.getInterviewType() == InterviewType.CS) {
            Question nextQuestion = null;
            if (selectedQuestionId != null) {
                nextQuestion = questionRepository.findById(selectedQuestionId)
                        .orElseThrow(() -> new IllegalArgumentException("question not found. id=" + selectedQuestionId));
                if (nextText == null || nextText.isBlank()) {
                    nextText = nextQuestion.getContent();
                }
                // [?섏젙?? ?쇱そ 肄붾뱶 硫붿꽌???ъ슜
                keywords = getQuestionKeywords(selectedQuestionId);
            }
            turnBuilder.question(nextQuestion);
        } else { // PORTFOLIO
            PortfolioQuestion nextQuestion = null;
            if (selectedQuestionId != null) {
                nextQuestion = portfolioQuestionRepository.findById(selectedQuestionId)
                        .orElseThrow(() -> new IllegalArgumentException("portfolio_question not found. id=" + selectedQuestionId));
                if (nextText == null || nextText.isBlank()) {
                    nextText = nextQuestion.getContent();
                }
                // 포트폴리오 질문이 있으면 topic/intent를 keywords로 채웁니다
                List<String> kw = new ArrayList<>();
                if (nextQuestion.getTopic() != null && !nextQuestion.getTopic().isBlank()) {
                    kw.add(nextQuestion.getTopic());
                }
                if (nextQuestion.getIntent() != null && !nextQuestion.getIntent().isBlank()) {
                    kw.add(nextQuestion.getIntent());
                }
                if (!kw.isEmpty()) {
                    keywords = kw;
                }
            } else {
                // selectedQuestionId가 없고 텍스트만 있는 경우, 텍스트를 임시 키워드로 사용
                if (selectedQuestionText != null && !selectedQuestionText.isBlank()) {
                    keywords = List.of(selectedQuestionText);
                }
            }
            turnBuilder.portfolioQuestion(nextQuestion);
        }

        if (nextText == null || nextText.isBlank()) {
            throw new IllegalStateException("AI response missing selected question text.");
        }
        turnBuilder.questionText(nextText);

        InterviewTurn saved = turnRepository.save(turnBuilder.build());

        return new NextQuestionResponse(
                interview.getId(), saved.getId(), nextIndex, saved.getQuestionText(),
                true, parentTurn != null ? parentTurn.getId() : null, keywords
        );
    }

    private List<AiAnalyzeRequest.NextQuestionCandidate> buildNextQuestionCandidates(InterviewTurn turn, InterviewType interviewType) {
        if (interviewType == InterviewType.CS) {
            return collectQuestionCandidates(turn.getQuestion());
        }
        return collectPortfolioCandidates(turn.getPortfolioQuestion());
    }

    private List<AiAnalyzeRequest.NextQuestionCandidate> collectQuestionCandidates(Question question) {
        if (question == null) {
            return List.of();
        }
        List<AiAnalyzeRequest.NextQuestionCandidate> candidates = new ArrayList<>();
        appendQuestionChildren(question.getId(), candidates);
        return candidates;
    }

    private void appendQuestionChildren(Long parentId, List<AiAnalyzeRequest.NextQuestionCandidate> accumulator) {
        questionRepository.findByParent_IdOrderByIdAsc(parentId).forEach(child -> {
            accumulator.add(new AiAnalyzeRequest.NextQuestionCandidate(child.getId(), child.getContent()));
            appendQuestionChildren(child.getId(), accumulator);
        });
    }

    private List<AiAnalyzeRequest.NextQuestionCandidate> collectPortfolioCandidates(PortfolioQuestion question) {
        if (question == null) {
            return List.of();
        }
        List<AiAnalyzeRequest.NextQuestionCandidate> candidates = new ArrayList<>();
        appendPortfolioChildren(question.getId(), candidates);
        return candidates;
    }

    private void appendPortfolioChildren(Long parentId, List<AiAnalyzeRequest.NextQuestionCandidate> accumulator) {
        portfolioQuestionRepository.findByParent_Id(parentId).forEach(child -> {
            accumulator.add(new AiAnalyzeRequest.NextQuestionCandidate(child.getId(), child.getContent()));
            appendPortfolioChildren(child.getId(), accumulator);
        });
    }

    private List<String> getQuestionKeywords(Long questionId) {
        if (questionId == null) {
            return List.of();
        }
        return questionKeywordRepository.findKeywordsByQuestionId(questionId);
    }

    private List<String> collectQuestionKeyTerms(Question question) {
        if (question == null) {
            return List.of();
        }
        return questionKeywordRepository.findByQuestion_Id(question.getId()).stream()
                .map(kw -> kw.getKeyword())
                .filter(k -> k != null && !k.isBlank())
                .toList();
    }
}
