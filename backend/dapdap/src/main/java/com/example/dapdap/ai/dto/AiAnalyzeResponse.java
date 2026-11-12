package com.example.dapdap.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiAnalyzeResponse {

    private boolean isFollowUp;
    private String nextQuestionText; // isFollowUp=true????瑗щ━吏덈Ц ?띿뒪??

    private String answerText;       // STT 寃곌낵
    private String questionText;     // ?됯? ???吏덈Ц(蹂댄넻 request.questionText? ?숈씪)

    private String feedbackText;     // 吏덈Ц蹂??쇰뱶諛?

    private Integer score;           // ?좏깮
    private String feedbackJson;     // ?좏깮(JSON 臾몄옄??

    private Long selectedQuestionId; // AI ???좏깮???ㅼ쓬 吏덈Ц ID
    private String selectedQuestionText;
}
