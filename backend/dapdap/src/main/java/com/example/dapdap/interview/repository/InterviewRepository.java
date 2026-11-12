package com.example.dapdap.interview.repository;

import com.example.dapdap.interview.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
    Optional<Interview> findByIdAndUser_IdAndDeletedAtIsNull(Long interviewId, Long userId);

    @Query(value = """
        SELECT DISTINCT DATE(i.finished_at) AS d
        FROM interviews i
        WHERE i.user_id = :userId
          AND i.status = 'FINISHED'
          AND i.finished_at IS NOT NULL
          AND i.deleted_at IS NULL
        ORDER BY d DESC
        LIMIT :limitDays
        """, nativeQuery = true)
    List<LocalDate> findFinishedDatesDesc(
            @Param("userId") long userId,
            @Param("limitDays") int limitDays
    );
    @Query(value = """
    SELECT DISTINCT DATE(i.finished_at) AS d
    FROM interviews i
    WHERE i.user_id = :userId
      AND i.status = 'FINISHED'
      AND i.finished_at IS NOT NULL
      AND i.deleted_at IS NULL
    ORDER BY d DESC
    """, nativeQuery = true)
    List<java.sql.Date> findAllFinishedDatesDesc(@Param("userId") long userId);

    List<Interview> findByUser_IdAndDeletedAtIsNullOrderByCreatedAtDesc(Long userId);

    long countByUser_IdAndDeletedAtIsNull(Long userId);

    @Query("select i.id from Interview i where i.user.id = :userId order by i.createdAt desc")
    List<Long> findRecentIdsByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query(value = """
    SELECT DATE(i.finished_at) AS finished_date,
           COUNT(*) AS interview_count
    FROM interviews i
    WHERE i.user_id = :userId
      AND i.status = 'FINISHED'
      AND i.finished_at IS NOT NULL
      AND i.deleted_at IS NULL
    GROUP BY finished_date
    ORDER BY finished_date DESC
    """, nativeQuery = true)
    List<InterviewDateCountRow> findFinishedDateCountsDesc(@Param("userId") long userId);

}
