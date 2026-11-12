package com.example.dapdap.interview.repository;

import com.example.dapdap.interview.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReportRepository extends JpaRepository<Report, Long> {

    Optional<Report> findByInterview_Id(Long interviewId);

    boolean existsByInterview_Id(Long interviewId);
}
