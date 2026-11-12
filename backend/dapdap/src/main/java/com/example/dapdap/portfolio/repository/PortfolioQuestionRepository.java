package com.example.dapdap.portfolio.repository;

import com.example.dapdap.portfolio.entity.PortfolioQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PortfolioQuestionRepository extends JpaRepository<PortfolioQuestion, Long> {

    /**
     * 특정 포트폴리오에 속한 메인 질문(depth=0) 중 하나를 랜덤으로 선택
     * @param portfolioId 포트폴리오 ID
     * @return 랜덤 질문
     */
    @Query(value = "SELECT * FROM portfolio_questions WHERE portfolio_id = :portfolioId AND depth = 0 ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Optional<PortfolioQuestion> findRandomMainByPortfolio(@Param("portfolioId") Long portfolioId);

    /**
     * 특정 포트폴리오에 속한 메인 질문(depth=0) 중, 이미 사용한 질문들을 제외하고 랜덤으로 선택
     * @param portfolioId 포트폴리오 ID
     * @param usedIds 이미 사용한 질문 ID 목록
     * @return 랜덤 질문
     */
    @Query(value = "SELECT * FROM portfolio_questions WHERE portfolio_id = :portfolioId AND depth = 0 AND id NOT IN :usedIds ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Optional<PortfolioQuestion> findRandomMainByPortfolioExclude(@Param("portfolioId") Long portfolioId, @Param("usedIds") List<Long> usedIds);

    List<PortfolioQuestion> findByParent_Id(Long parentId);
}
