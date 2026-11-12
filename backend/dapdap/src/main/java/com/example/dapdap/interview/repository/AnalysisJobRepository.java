package com.example.dapdap.interview.repository;

import com.example.dapdap.interview.entity.AnalysisJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AnalysisJobRepository extends JpaRepository<AnalysisJob, Long> {
    Optional<AnalysisJob> findTopByInterview_IdAndTurnIdOrderByIdDesc(Long interviewId, Long turnId);

    List<AnalysisJob> findByInterview_IdOrderByIdDesc(Long interviewId);
}
