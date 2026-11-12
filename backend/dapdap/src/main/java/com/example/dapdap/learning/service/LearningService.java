package com.example.dapdap.learning.service;


import com.example.dapdap.learning.dto.PageResponse;
import com.example.dapdap.learning.dto.QuestionDetailResponse;
import com.example.dapdap.learning.dto.QuestionListItemResponse;
import com.example.dapdap.learning.entity.LearningQuestionScrap;
import com.example.dapdap.learning.repository.LearningQuestionScrapRepository;
import com.example.dapdap.question.entity.Question;
import com.example.dapdap.question.repository.QuestionRepository;
import com.example.dapdap.users.entity.User;
import com.example.dapdap.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LearningService {
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final LearningQuestionScrapRepository scrapRepository;

    public PageResponse<QuestionListItemResponse> getQuestionByCategory(Long categoryId, int page, int size){
        Sort sort = Sort.by(
                Sort.Order.asc("id")
        );

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Question> result = (categoryId == null)
                ? questionRepository.findAllByParentIsNull(pageable)
                : questionRepository.findByCategory_IdAndParentIsNull(categoryId, pageable);

        List<QuestionListItemResponse> items = result.getContent()
                .stream()
                .map(this::toListItem)
                .collect(Collectors.toList());

        return new PageResponse<>(
                items,
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    @Transactional
    public QuestionDetailResponse getQuestionDetail(Long questionId){
        Question q = questionRepository.findById(questionId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Question not found: " + questionId));

        q.increaseViews();

        List<QuestionDetailResponse.FollowUpQuestionResponse> followUps = questionRepository
                .findByParent_IdOrderByIdAsc(questionId)
                .stream()
                .map(child -> new QuestionDetailResponse.FollowUpQuestionResponse(
                        child.getId(),
                        child.getContent(),
                        child.getModelAnswer()
                ))
                .collect(Collectors.toList());

        return new QuestionDetailResponse(
                q.getId(),
                q.getDifficulty(),
                q.getParent() == null ? null : q.getParent().getId(),
                q.getContent(),
                q.getModelAnswer(),
                q.getViews(),
                followUps
        );
    }

    private QuestionListItemResponse toListItem(Question q){
        return new QuestionListItemResponse(
                q.getId(),
                makeTitle(q.getContent()),
                q.getDifficulty(),
                q.getParent() == null ? null : q.getParent().getId(),
                q.getCategory() == null ? null : q.getCategory().getId(),
                q.getCategory() == null ? null : q.getCategory().getName(),
                q.getViews()
        );
    }

    private String makeTitle(String content){
        if(content == null) return "";
        String oneLine = content.replace("\n", " ").replace("\r", " ").trim();
        int max = 60;
        return oneLine.length() <= max
                ? oneLine
                : oneLine.substring(0, max) + "...";
    }

    @Transactional
    public void scrap(Long questionId, Long userId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("question not found. id=" + questionId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("user not found. id=" + userId));

        LearningQuestionScrap scrap = scrapRepository
                .findByUserIdAndQuestionId(userId, questionId)
                .orElse(null);

        if (scrap == null) {
            scrapRepository.save(new LearningQuestionScrap(question, user));
            return;
        }
        if (scrap.isDeleted()) {
            scrap.recover();
            return;
        }
        // already scrapped; ignore or throw if needed
    }

    @Transactional
    public void unscrap(Long questionId, Long userId) {
        LearningQuestionScrap scrap = scrapRepository
                .findByUserIdAndQuestionId(userId, questionId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "scrap not found. questionId=" + questionId + ", userId=" + userId));

        if (!scrap.isDeleted()) {
            scrap.softDelete();
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<QuestionListItemResponse> getScrappedQuestions(Long userId, int page, int size){
        Sort sort = Sort.by(Sort.Order.desc("createdAt"));
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<LearningQuestionScrap> result = scrapRepository.findByUserIdAndDeletedAtIsNull(userId, pageable);

        List<QuestionListItemResponse> items = result.getContent()
                .stream()
                .map(scrap -> toListItem(scrap.getQuestion()))
                .collect(Collectors.toList());

        return new PageResponse<>(
                items,
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }
}
