package com.example.dapdap.question.repository;

import com.example.dapdap.question.entity.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    @EntityGraph(attributePaths = "category")
    Page<Question> findByCategory_IdAndParentIsNull(Long categoryId, Pageable pageable);

    @EntityGraph(attributePaths = "category")
    Page<Question> findAllByParentIsNull(Pageable pageable);
    // MySQL 전용: ORDER BY RAND() (MVP 용)
    @Query(value = """
        SELECT *
        FROM questions q
        WHERE q.category_id = :categoryId
          AND (q.parent_id IS NULL)  -- 메인 질문만 우선 사용 (원하면 제거 가능)
          AND q.question_id NOT IN (:excludeIds)
        ORDER BY RAND()
        LIMIT 1
        """, nativeQuery = true)
    Optional<Question> findRandomMainByCategoryExclude(
            @Param("categoryId") long categoryId,
            @Param("excludeIds") List<Long> excludeIds
    );

    @Query(value = """
        SELECT *
        FROM questions q
        WHERE q.category_id = :categoryId
          AND (q.parent_id IS NULL)
        ORDER BY RAND()
        LIMIT 1
        """, nativeQuery = true)
    Optional<Question> findRandomMainByCategory(@Param("categoryId") long categoryId);

    List<Question> findByParent_IdOrderByIdAsc(Long parentId);
}
