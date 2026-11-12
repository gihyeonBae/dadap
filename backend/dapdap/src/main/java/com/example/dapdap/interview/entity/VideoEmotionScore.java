package com.example.dapdap.interview.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class VideoEmotionScore {
    @Column(name = "emotion", length = 50)
    private String emotion;

    @Column(name = "percent")
    private Integer percent;
}
