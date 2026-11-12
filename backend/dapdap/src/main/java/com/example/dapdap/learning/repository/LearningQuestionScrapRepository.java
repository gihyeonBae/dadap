package com.example.dapdap.learning.repository;

import com.example.dapdap.learning.entity.LearningQuestionScrap;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LearningQuestionScrapRepository extends JpaRepository<LearningQuestionScrap, Long> {
    Optional<LearningQuestionScrap> findByUserIdAndQuestionId(Long userId, Long questionId);
    boolean existsByUserIdAndQuestionIdAndDeletedAtIsNull(Long userId, Long questionId);
    List<LearningQuestionScrap> findAllByUserIdAndDeletedAtIsNull(Long userId);
    long countByUserIdAndDeletedAtIsNull(Long userId);

    Page<LearningQuestionScrap> findByUserIdAndDeletedAtIsNull(Long userId, Pageable pageable);
}
