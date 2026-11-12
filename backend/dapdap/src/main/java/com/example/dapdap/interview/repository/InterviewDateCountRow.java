package com.example.dapdap.interview.repository;

import java.time.LocalDate;

public interface InterviewDateCountRow {
    LocalDate getFinishedDate();
    long getInterviewCount();
}