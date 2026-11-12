package com.example.dapdap.learning.repository;

import com.example.dapdap.learning.entity.QuestionKeyword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuestionKeywordRepository extends JpaRepository<QuestionKeyword, Long> {

    @Query("""
        select qk.keyword
        from QuestionKeyword qk
        where qk.question.id = :questionId
        order by qk.keywordId asc
    """)
    List<String> findKeywordsByQuestionId(@Param("questionId") Long questionId);

    List<QuestionKeyword> findByQuestion_Id(Long questionId);

}