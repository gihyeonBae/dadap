package com.example.dapdap.users.service;

import com.example.dapdap.auth.domain.CustomUserDetails;
import com.example.dapdap.auth.service.AuthService;
import com.example.dapdap.global.exception.CustomException;
import com.example.dapdap.global.exception.ErrorCode;
import com.example.dapdap.storage.service.S3KeyFactory;
import com.example.dapdap.storage.service.S3UploadService;
import com.example.dapdap.users.domain.JobTitle;
import com.example.dapdap.users.dto.request.PasswordChangeRequest;
import com.example.dapdap.users.dto.request.UpdateMeRequest;
import com.example.dapdap.users.dto.request.DeleteMeRequest;
import com.example.dapdap.users.dto.response.PasswordChangeResponse;
import com.example.dapdap.users.dto.response.ProfileImageResponse;
import com.example.dapdap.users.dto.response.UserMeResponse;
import com.example.dapdap.users.dto.response.UserProfileUpdateResponse;
import com.example.dapdap.users.dto.response.MyPageSummaryResponse;
import com.example.dapdap.users.entity.User;
import com.example.dapdap.users.repository.UserRepository;
import com.example.dapdap.interview.repository.InterviewRepository;
import com.example.dapdap.interview.repository.InterviewTurnRepository;
import com.example.dapdap.interview.service.InterviewStreakService;
import com.example.dapdap.learning.repository.LearningQuestionScrapRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserMeService {

    private static final long MAX_PROFILE_IMAGE_BYTES = 5L * 1024 * 1024;


    @Value("${app.s3.bucket}")
    private String bucket;

    @Value("${app.s3.region}")
    private String region;


    private final UserRepository userRepository;
    private final AuthService authService;
    private final BCryptPasswordEncoder encoder;
    private final S3UploadService uploadService;
    private final S3KeyFactory keyFactory;
    private final InterviewRepository interviewRepository;
    private final InterviewTurnRepository interviewTurnRepository;
    private final InterviewStreakService interviewStreakService;
    private final LearningQuestionScrapRepository scrapRepository;

    @Transactional(readOnly = true)
    public UserMeResponse getMe(CustomUserDetails userDetails) {
        User user = getUser(userDetails);
        return toMeResponse(user);
    }

    @Transactional(readOnly = true)
    public MyPageSummaryResponse getMyPageSummary(CustomUserDetails userDetails) {
        User user = getUser(userDetails);
        Long userId = user.getId();

        Double averageSttScore = findRecentAverageSttScore(userId);
        long totalInterviewCount = interviewRepository.countByUser_IdAndDeletedAtIsNull(userId);
        int currentStreakDays = interviewStreakService.getCurrentStreak(userId).getCurrentStreak();
        long scrapCount = scrapRepository.countByUserIdAndDeletedAtIsNull(userId);

        return new MyPageSummaryResponse(averageSttScore, totalInterviewCount, currentStreakDays, scrapCount);
    }

    @Transactional(readOnly = true)
    public boolean isNicknameAvailable(CustomUserDetails userDetails, String rawNickname) {
        User user = getUser(userDetails);
        String nickname = normalizeNickname(rawNickname);
        if (nickname.equals(user.getNickname())) {
            return true;
        }
        return !userRepository.existsByNickname(nickname);
    }

    @Transactional
    public UserProfileUpdateResponse updateProfile(CustomUserDetails userDetails, UpdateMeRequest request) {
        User user = getUser(userDetails);

        if (request.getNickname() != null) {
            String nickname = request.getNickname().trim();
            if (!nickname.equals(user.getNickname()) && userRepository.existsByNickname(nickname)) {
                throw new CustomException(ErrorCode.CONFLICT, "Nickname already in use.");
            }
            user.updateNickname(nickname);
        }

        if (request.getJobTitle() != null) {
            JobTitle jobTitle = parseJobTitle(request.getJobTitle());
            user.updateJobTitle(jobTitle);
        }

        if (request.getBio() != null) {
            user.updateBio(request.getBio());
        }

        return toProfileUpdateResponse(user);
    }

    @Transactional
    public ProfileImageResponse uploadProfileImage(CustomUserDetails userDetails, MultipartFile file) {
        User user = getUser(userDetails);

        validateProfileImage(file);

        String ext = resolveExtension(file.getContentType());
        String key = keyFactory.profileImageKey(user.getId(), ext, UUID.randomUUID().toString());
        uploadService.upload(file, key);

        user.updateProfileUrl(buildPublicUrl(key));

        return new ProfileImageResponse(user.getProfileUrl(), user.getUpdatedAt());
    }

    @Transactional
    public ProfileImageResponse deleteProfileImage(CustomUserDetails userDetails) {
        User user = getUser(userDetails);
        user.updateProfileUrl(null);
        return new ProfileImageResponse(null, user.getUpdatedAt());
    }

    @Transactional
    public PasswordChangeResponse changePassword(CustomUserDetails userDetails, PasswordChangeRequest request) {
        User user = getUser(userDetails);

        if (isSocialUser(user)) {
            throw new CustomException(ErrorCode.INVALID_PARAMETER, "Social login users cannot change password.");
        }

        if (!encoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new CustomException(ErrorCode.UNAUTHORIZED, "현재 비밀번호가 일치하지 않습니다.");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new CustomException(ErrorCode.INVALID_PARAMETER, "새로운 비밀번호가 일치하지 않습니다.");
        }

        if (!isValidPassword(request.getNewPassword())) {
            throw new CustomException(ErrorCode.INVALID_PARAMETER, "Password must be at least 8 chars and include letters, numbers, and symbols.");
        }

        user.changePassword(encoder.encode(request.getNewPassword()));
        return new PasswordChangeResponse(true);
    }


    @Transactional
    public void deleteMe(CustomUserDetails userDetails, DeleteMeRequest request) {
        User user = getUser(userDetails);

        if (!isSocialUser(user)) {
            String raw = request != null ? request.getPassword() : null;
            if (raw == null || raw.isBlank()) {
                throw new CustomException(ErrorCode.INVALID_PARAMETER, "Password is required.");
            }
            if (user.getPassword() == null || !encoder.matches(raw, user.getPassword())) {
                throw new CustomException(ErrorCode.UNAUTHORIZED, "Password is invalid.");
            }
        }

        removeProfileImageIfPresent(user);
        user.updateProfileUrl(null);
        user.updateNickname("탈퇴한 사용자#" + user.getId());
        user.softDelete();

        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            authService.logout(user.getEmail());
        }
    }

    private User getUser(CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "User not found."));
    }

    private JobTitle parseJobTitle(String raw) {
        try {
            return JobTitle.valueOf(raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new CustomException(ErrorCode.INVALID_PARAMETER, "Invalid jobTitle.");
        }
    }

    private void validateProfileImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new CustomException(ErrorCode.INVALID_PARAMETER, "Profile image file is required.");
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/png") && !contentType.equals("image/jpeg"))) {
            throw new CustomException(ErrorCode.INVALID_PARAMETER, "Only PNG/JPEG images are allowed.");
        }

        if (file.getSize() > MAX_PROFILE_IMAGE_BYTES) {
            throw new CustomException(ErrorCode.INVALID_PARAMETER, "Profile image must be 5MB or less.");
        }
    }

    private boolean isValidPassword(String password) {
        return password != null && password.matches("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,}$");
    }

    private String resolveExtension(String contentType) {
        if ("image/jpeg".equals(contentType)) {
            return "jpg";
        }
        return "png";
    }

    private String buildPublicUrl(String key) {
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucket, region, key);
    }

    private String normalizeNickname(String nickname) {
        if (nickname == null || nickname.trim().isEmpty()) {
            throw new CustomException(ErrorCode.INVALID_PARAMETER, "Nickname is required.");
        }
        return nickname.trim();
    }

    private UserMeResponse toMeResponse(User user) {
        return new UserMeResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getJobTitle() != null ? user.getJobTitle().name() : null,
                user.getBio(),
                user.getProfileUrl(),
                user.getSocialType(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    private boolean isSocialUser(User user) {
        return user.getSocialType() != null && !user.getSocialType().isBlank();
    }

    private Double findRecentAverageSttScore(Long userId) {
        var interviewIds = interviewRepository.findRecentIdsByUserId(userId, PageRequest.of(0, 10));
        if (interviewIds.isEmpty()) {
            return null;
        }
        return interviewTurnRepository.findAverageSttScoreByInterviewIds(interviewIds);
    }

    private void removeProfileImageIfPresent(User user) {
        String url = user.getProfileUrl();
        if (url == null || url.isBlank()) {
            return;
        }
        String key = extractS3Key(url);
        if (key != null && !key.isBlank()) {
            uploadService.deleteByKey(key);
        }
    }

    private String extractS3Key(String url) {
        String marker = "amazonaws.com/";
        int idx = url.indexOf(marker);
        if (idx == -1) {
            return null;
        }
        return url.substring(idx + marker.length());
    }


    private UserProfileUpdateResponse toProfileUpdateResponse(User user) {
        return new UserProfileUpdateResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getJobTitle() != null ? user.getJobTitle().name() : null,
                user.getBio(),
                user.getProfileUrl(),
                user.getUpdatedAt()
        );
    }
}
