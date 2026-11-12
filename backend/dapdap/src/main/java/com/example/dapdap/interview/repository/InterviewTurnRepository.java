package com.example.dapdap.interview.repository;

import com.example.dapdap.interview.dto.response.RawAverageRow;
import com.example.dapdap.interview.entity.InterviewTurn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface InterviewTurnRepository extends JpaRepository<InterviewTurn, Long> {

    Optional<InterviewTurn> findByIdAndInterview_Id(Long turnId, Long interviewId);

    List<InterviewTurn> findByInterview_IdOrderByTurnIndexAsc(Long interviewId);

    @Query("""
        select t.sttScore
        from InterviewTurn t
        join t.interview i
        where i.user.id = :userId
          and i.deletedAt is null
          and t.sttScore is not null
        order by t.createdAt desc
    """)
    List<Integer> findLatestSttScores(@Param("userId") Long userId, Pageable pageable);

    @Query("""
        select avg(t.sttScore)
        from InterviewTurn t
        join t.interview i
        where i.user.id = :userId
          and t.sttScore is not null
    """)
    Double findAverageSttScore(@Param("userId") Long userId);

    @Query("""
        select avg(t.sttScore)
        from InterviewTurn t
        where t.interview.id in :interviewIds
          and t.sttScore is not null
    """)
    Double findAverageSttScoreByInterviewIds(@Param("interviewIds") List<Long> interviewIds);

    /**
     * 특정 면접에서 가장 마지막 차례(turn)를 조회
     * @param interviewId 면접 ID
     * @return 가장 마지막 InterviewTurn
     */
    Optional<InterviewTurn> findFirstByInterviewIdOrderByTurnIndexDesc(Long interviewId);

    @Query("""
        select t.question.id
        from InterviewTurn t
        where t.interview.id = :interviewId
          and t.question is not null
    """)
    List<Long> findUsedQuestionIds(@Param("interviewId") Long interviewId);

    @Query("""
        select t.portfolioQuestion.id
        from InterviewTurn t
        where t.interview.id = :interviewId
          and t.portfolioQuestion is not null
    """)
    List<Long> findUsedPortfolioQuestionIds(@Param("interviewId") Long interviewId);

    @Query("""
    SELECT new com.example.dapdap.interview.dto.response.RawAverageRow(
        i.id,
        i.finishedAt,
        c.id,
        COALESCE(c.name, 'PORTFOLIO'),
        AVG(COALESCE(t.sttScore, 0)),
        COUNT(t.id)
    )
    FROM InterviewTurn t
    JOIN t.interview i
    LEFT JOIN i.category c
    WHERE i.user.id = :userId
      AND i.status = com.example.dapdap.interview.entity.InterviewStatus.FINISHED
      AND i.finishedAt BETWEEN :from AND :to
    GROUP BY i.id, i.finishedAt, c.id, c.name
    ORDER BY i.finishedAt DESC, c.name ASC
""")
    List<RawAverageRow> findDailyCategorySessionAverages(
            @Param("userId") long userId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );


}
