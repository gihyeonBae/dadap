package com.example.dapdap.interview.event;

import com.example.dapdap.interview.service.VideoAnalysisWorker;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;

@Component
@RequiredArgsConstructor
public class VideoAnalysisRequestedListener {

    private final VideoAnalysisWorker videoAnalysisWorker;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(VideoAnalysisRequestedEvent event) {
        videoAnalysisWorker.runVideoAnalysisAsync(event.jobId(), event.userId());
    }
}
