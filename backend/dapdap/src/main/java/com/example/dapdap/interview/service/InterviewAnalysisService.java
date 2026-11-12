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
public class InterviewAnalysisService {

    private final InterviewRepository interviewRepository;
    private final InterviewTurnRepository turnRepository;
    private final QuestionRepository questionRepository;
    private final QuestionKeywordRepository questionKeywordRepository;

    private final AiAnalyzeService aiAnalyzeService;

    @Transactional
    public AnalyzeTurnResponse analyzeTurn(Long userId, Long interviewId, Long turnId) {

        Interview interview = interviewRepository.findByIdAndUser_IdAndDeletedAtIsNull(interviewId, userId)
            .orElseThrow(() -> new IllegalArgumentException("면접을 찾을 수 없습니다. interviewId=" + interviewId));

        if (interview.getStatus() != InterviewStatus.IN_PROGRESS) {
            throw new IllegalArgumentException("진행 중인 면접이 아닙니다. status=" + interview.getStatus());
        }

        InterviewTurn turn = turnRepository.findByIdAndInterview_Id(turnId, interviewId)
            .orElseThrow(() -> new IllegalArgumentException("턴을 찾을 수 없습니다. turnId=" + turnId));

        // 분석 조건 검증
        if (turn.getAudioKey() == null || turn.getAudioKey().isBlank()) {
            throw new IllegalArgumentException("분석을 위해 audioKey가 필요합니다. 먼저 오디오 업로드를 완료하세요.");
        }
        if (turn.getAnalysisStatus() == AnalysisStatus.DONE) {
            throw new IllegalArgumentException("이미 분석 완료된 턴입니다.");
        }
        if (turn.getAnalysisStatus() == AnalysisStatus.RUNNING) {
            throw new IllegalArgumentException("현재 분석 중인 턴입니다.");
        }

        // 중복 호출 방지: AI 호출 전에 RUNNING 표시
        turn.markAnalysisRunning();

        Question question = turn.getQuestion();
        Long questionId = question != null ? question.getId() : null;
        String modelAnswer = question != null ? question.getModelAnswer() : null;

        List<AiAnalyzeRequest.NextQuestionCandidate> nextQuestionCandidates = collectQuestionCandidates(question);
        List<String> keyTerms = collectQuestionKeyTerms(question);

        AiAnalyzeRequest req = new AiAnalyzeRequest(
            interviewId,
            turnId,
            turn.getQuestionText(),
            turn.getAudioKey(),
            turn.getVideoKey(),
            questionId,
            modelAnswer,
            keyTerms,
            nextQuestionCandidates
        );

        AiAnalyzeResponse aiRes;
        try {
            aiRes = aiAnalyzeService.analyze(req);
        } catch (Exception e) {
            log.error("AI analyze failed: interviewId={}, turnId={}", interviewId, turnId, e);
            turn.markAnalysisFailed();
            throw new IllegalStateException("AI 분석 실패: " + e.getMessage(), e);
        }

        // 현재 턴에 분석 결과 저장
        turn.applyAnalysisResult(
                aiRes.getAnswerText(),
                aiRes.getFeedbackText(),
                aiRes.getFeedbackJson(),
                aiRes.getScore()
        );
        turn.markAnalysisDone();

        interview.increaseAskedCount();
        boolean reachedTarget = interview.isFinishedByCount();
        NextQuestionResponse nextTurn = null;
        if (!reachedTarget) {
            Long selectedQuestionId = aiRes.getSelectedQuestionId();
            String selectedQuestionText = aiRes.getSelectedQuestionText();

            if (selectedQuestionId != null || (selectedQuestionText != null && !selectedQuestionText.isBlank())) {
                int nextIndex = interview.getAskedCount() + 1;

                Question nextQuestion = null;
                String nextText = selectedQuestionText;
                List<String> keywords = List.of();

                if (selectedQuestionId != null) {
                    nextQuestion = questionRepository.findById(selectedQuestionId)
                            .orElseThrow(() -> new IllegalArgumentException("question not found. id=" + selectedQuestionId));
                    if (nextText == null || nextText.isBlank()) {
                        throw new IllegalStateException("AI response missing selected question text.");
                    }
                    keywords = getQuestionKeywords(selectedQuestionId);
                }

                if (nextText == null || nextText.isBlank()) {
                    throw new IllegalStateException("AI response missing selected question text.");
                }

                InterviewTurn next = InterviewTurn.builder()
                        .interview(interview)
                        .turnIndex(nextIndex)
                        .followUp(false)
                        .parentTurn(null)
                        .question(nextQuestion)
                        .questionText(nextText)
                        .analysisStatus(AnalysisStatus.PENDING)
                        .build();

                InterviewTurn saved = turnRepository.save(next);

                nextTurn = new NextQuestionResponse(
                        interviewId,
                        saved.getId(),
                        nextIndex,
                        saved.getQuestionText(),
                        false,
                        null,
                        keywords
                );
            }
        }

        // 면접 종료 판단 (최종)
        boolean finished = false;
        boolean lastTurn = reachedTarget || nextTurn == null;
        if (lastTurn) {
            interview.finish();
            finished = true;
        }

        return new AnalyzeTurnResponse(
                finished,
                interviewId,
                turn.getId(),
                turn.getTurnIndex(),
                turn.getQuestionText(),
                turn.getAnswerText(),
                turn.getFeedbackText(),
                turn.isFollowUp(),
                nextTurn
        );
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
                .map(k -> k.getKeyword())
                .filter(k -> k != null && !k.isBlank())
                .toList();
    }
}
