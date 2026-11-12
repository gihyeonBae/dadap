package com.example.dapdap.interview.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class VideoAnalysisSummary {
    private Integer duration;
    private Integer eyeContactScore;
    private Integer poseStabilityScore;
    private Integer movementScore;
    private String mainEmotion;
}
