package com.example.dapdap.auth.service;

import com.example.dapdap.auth.domain.Role;
import com.example.dapdap.auth.dto.SignupRequest;
import com.example.dapdap.auth.entity.RefreshToken;
import com.example.dapdap.auth.repository.RefreshTokenRepository;
import com.example.dapdap.auth.util.EmailAuthStorage;
import com.example.dapdap.auth.util.MailService;
import com.example.dapdap.global.exception.CustomException;
import com.example.dapdap.global.exception.ErrorCode;
import com.example.dapdap.users.entity.User;
import com.example.dapdap.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final BCryptPasswordEncoder encoder;
    private final EmailAuthStorage emailAuthStorage;
    private final MailService mailService;

    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.user.default-profile-image-url:https://cdn.dapdap.com/profile/default.png}")
    private String defaultProfileImageUrl;

    @Transactional(readOnly = true)
    public boolean isNicknameAvailable(String rawNickname) {
        String nickname = normalizeNickname(rawNickname);
        return !userRepository.existsByNickname(nickname);
    }

    public void signup(SignupRequest request) {

        // 409가 더 의미적으로 맞음 (이미 존재)
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException(ErrorCode.CONFLICT, "이미 사용 중인 이메일입니다.");
        }
        if (userRepository.existsByNickname(request.getNickname())) {
            throw new CustomException(ErrorCode.CONFLICT, "이미 사용 중인 닉네임입니다.");
        }

        String encodedPassword = encoder.encode(request.getPassword());

        User user = User.builder()
                .email(request.getEmail())
                .password(encodedPassword)
                .nickname(request.getNickname())
                .role(Role.USER)
                .status(com.example.dapdap.auth.domain.UserStatus.ACTIVE)
                .profileUrl(defaultProfileImageUrl)
                .socialType(null)
                .socialId(null)
                .build();

        userRepository.save(user);
    }

    private String normalizeNickname(String nickname) {
        if (nickname == null || nickname.trim().isEmpty()) {
            throw new CustomException(ErrorCode.INVALID_PARAMETER, "Nickname is required.");
        }
        return nickname.trim();
    }

    @Transactional(readOnly = true)
    public User login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                // 존재하지 않는 이메일: 보안상 구체 사유를 숨기고 401로 통일 권장
                .orElseThrow(() -> new CustomException(ErrorCode.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다."));

        if (user.getStatus() != null && user.getStatus() == com.example.dapdap.auth.domain.UserStatus.INACTIVE) {
            // 정책 선택: 비활성 계정은 보통 403 또는 400
            throw new CustomException(ErrorCode.FORBIDDEN, "비활성화된 계정입니다.");
        }

        if (user.getPassword() == null || !encoder.matches(rawPassword, user.getPassword())) {
            throw new CustomException(ErrorCode.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        return user;
    }

    public void saveRefreshToken(String email, String token) {
        User user = userRepository.findByEmail(email)
                // 여기까지 왔는데 유저가 없다면 비정상 상태 → 404가 더 자연스러움
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        refreshTokenRepository.findByUser_Email(email)
                .ifPresentOrElse(
                        rt -> rt.rotate(token),
                        () -> refreshTokenRepository.save(new RefreshToken(user, token))
                );
    }

    @Transactional(readOnly = true)
    public String findRefreshToken(String email) {
        return refreshTokenRepository.findByUser_Email(email)
                .map(RefreshToken::getToken)
                .orElse(null);
    }

    public void logout(String email) {
        refreshTokenRepository.deleteByUser_Email(email);
    }

    public void sendResetPasswordMail(String email) {

        userRepository.findByEmail(email)
                // 이메일 기반으로 존재 여부를 드러내고 싶지 않으면 200 OK로 흡수하는 정책도 있음.
                // 지금은 명확히 404로 처리
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "해당 이메일로 가입한 유저가 없습니다."));

        emailAuthStorage.delete(email);

        String code = String.format("%06d", secureRandom.nextInt(1_000_000));

        emailAuthStorage.save(email, code);

        mailService.sendMail(
                email,
                "비밀번호 재설정 코드",
                "인증코드: " + code + "\n(5분간 유효합니다)"
        );
    }

    public void resetPassword(String email, String code) {

        String saved = emailAuthStorage.get(email);

        if (saved == null) {
            // 인증 코드 만료/부재는 인증 실패 성격 → 401 권장
            throw new CustomException(ErrorCode.UNAUTHORIZED, "인증코드가 만료되었거나 존재하지 않습니다.");
        }
        if (!saved.equals(code)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED, "인증코드가 올바르지 않습니다.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "해당 이메일로 가입한 유저가 없습니다."));

        String tempPassword = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        String encoded = encoder.encode(tempPassword);

        user.changePassword(encoded);

        mailService.sendMail(
                email,
                "임시 비밀번호",
                "임시 비밀번호: " + tempPassword + "\n로그인 후 반드시 비밀번호를 변경하세요."
        );

        emailAuthStorage.delete(email);
    }
}
