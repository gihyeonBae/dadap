package com.example.dapdap.users.service;

import com.example.dapdap.auth.domain.CustomUserDetails;
import com.example.dapdap.global.exception.CustomException;
import com.example.dapdap.global.exception.ErrorCode;
import com.example.dapdap.storage.service.S3KeyFactory;
import com.example.dapdap.storage.service.S3UploadService;
import com.example.dapdap.users.domain.JobTitle;
import com.example.dapdap.users.dto.request.PasswordChangeRequest;
import com.example.dapdap.users.dto.request.UpdateMeRequest;
import com.example.dapdap.users.dto.response.PasswordChangeResponse;
import com.example.dapdap.users.dto.response.ProfileImageResponse;
import com.example.dapdap.users.dto.response.UserMeResponse;
import com.example.dapdap.users.dto.response.UserProfileUpdateResponse;
import com.example.dapdap.users.entity.User;
import com.example.dapdap.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

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
    private final BCryptPasswordEncoder encoder;
    private final S3UploadService uploadService;
    private final S3KeyFactory keyFactory;

    @Transactional(readOnly = true)
    public UserMeResponse getMe(CustomUserDetails userDetails) {
        User user = getUser(userDetails);
        return toMeResponse(user);
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

        if (!encoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new CustomException(ErrorCode.UNAUTHORIZED, "Current password is invalid.");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new CustomException(ErrorCode.INVALID_PARAMETER, "New password and confirm password do not match.");
        }

        if (!isValidPassword(request.getNewPassword())) {
            throw new CustomException(ErrorCode.INVALID_PARAMETER, "Password must be at least 8 chars and include letters, numbers, and symbols.");
        }

        user.changePassword(encoder.encode(request.getNewPassword()));
        return new PasswordChangeResponse(true);
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
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
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
