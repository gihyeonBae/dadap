package com.example.dapdap.interview.service;

import com.example.dapdap.interview.dto.response.TurnMediaUploadResponse;
import com.example.dapdap.interview.entity.Interview;
import com.example.dapdap.interview.entity.InterviewStatus;
import com.example.dapdap.interview.entity.InterviewTurn;
import com.example.dapdap.interview.repository.InterviewRepository;
import com.example.dapdap.interview.repository.InterviewTurnRepository;
import com.example.dapdap.storage.dto.S3UploadResponse;
import com.example.dapdap.storage.service.S3KeyFactory;
import com.example.dapdap.storage.service.S3UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class InterviewTurnService {

    private final InterviewRepository interviewRepository;
    private final InterviewTurnRepository turnRepository;

    private final S3UploadService s3UploadService;
    private final S3KeyFactory keyFactory;

    @Transactional
    public TurnMediaUploadResponse uploadAudio(Long userId, Long interviewId, Long turnId, MultipartFile audioFile) {
        Interview interview = interviewRepository.findByIdAndUser_IdAndDeletedAtIsNull(interviewId, userId)
            .orElseThrow(() -> new IllegalArgumentException("면접을 찾을 수 없습니다. interviewId=" + interviewId));

        if (interview.getStatus() != InterviewStatus.IN_PROGRESS) {
            throw new IllegalArgumentException("진행 중인 면접이 아닙니다. status=" + interview.getStatus());
        }

        InterviewTurn turn = turnRepository.findByIdAndInterview_Id(turnId, interviewId)
            .orElseThrow(() -> new IllegalArgumentException("턴을 찾을 수 없습니다. turnId=" + turnId));

        String key = keyFactory.interviewAudioKey(interviewId, turn.getTurnIndex());
        S3UploadResponse uploaded = s3UploadService.upload(audioFile, key);

        // DB??key ???
        // (湲곗〈???낅줈?쒕맂 ?ㅺ? ?덈떎硫???뼱?곌린 ?뺤콉: ?⑥닚 overwrite)
        setAudioKey(turn, uploaded.getKey());

        return new TurnMediaUploadResponse(
                interviewId,
                turnId,
                turn.getTurnIndex(),
                "AUDIO",
                uploaded.getKey(),
                uploaded.getSize(),
                uploaded.getContentType()
        );
    }

    @Transactional
    public TurnMediaUploadResponse uploadVideo(Long userId, Long interviewId, Long turnId, MultipartFile videoFile) {
        Interview interview = interviewRepository.findByIdAndUser_IdAndDeletedAtIsNull(interviewId, userId)
                .orElseThrow(() -> new IllegalArgumentException("硫댁젒??李얠쓣 ???놁뒿?덈떎. interviewId=" + interviewId));

        if (interview.getStatus() != InterviewStatus.IN_PROGRESS) {
            throw new IllegalArgumentException("吏꾪뻾 以묒씤 硫댁젒???꾨떃?덈떎. status=" + interview.getStatus());
        }

        InterviewTurn turn = turnRepository.findByIdAndInterview_Id(turnId, interviewId)
                .orElseThrow(() -> new IllegalArgumentException("?댁쓣 李얠쓣 ???놁뒿?덈떎. turnId=" + turnId));

        String key = keyFactory.interviewVideoKey(interviewId, turn.getTurnIndex());
        S3UploadResponse uploaded = s3UploadService.upload(videoFile, key);

        // DB??key ???
        setVideoKey(turn, uploaded.getKey());

        return new TurnMediaUploadResponse(
                interviewId,
                turnId,
                turn.getTurnIndex(),
                "VIDEO",
                uploaded.getKey(),
                uploaded.getSize(),
                uploaded.getContentType()
        );
    }

    private void setAudioKey(InterviewTurn turn, String key) {
        // setter媛 ?녿떎硫??꾨옒 以??섎굹濡?泥섎━:
        // 1) ?뷀떚?곗뿉 updateAudioKey/updateVideoKey 硫붿꽌??異붽? (沅뚯옣)
        // 2) Reflection/field ?묎렐(鍮꾧텒??
        //
        // ?ш린?쒕뒗 ?뷀떚?곗뿉 硫붿꽌?쒕? 異붽??섎뒗 ?꾩젣瑜??〓땲??
        turn.updateAudioKey(key);
    }

    private void setVideoKey(InterviewTurn turn, String key) {
        turn.updateVideoKey(key);
    }
}
