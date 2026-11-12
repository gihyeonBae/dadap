package com.example.dapdap.auth.controller;

import com.example.dapdap.auth.domain.CustomUserDetails;
import com.example.dapdap.auth.domain.Role;
import com.example.dapdap.auth.domain.UserStatus;
import com.example.dapdap.auth.dto.*;
import com.example.dapdap.auth.jwt.JwtUtil;
import com.example.dapdap.auth.service.AuthService;
import com.example.dapdap.auth.service.GithubOauthService;
import com.example.dapdap.auth.service.GoogleOauthService;
import com.example.dapdap.global.exception.CustomException;
import com.example.dapdap.global.exception.ErrorCode;
import com.example.dapdap.global.response.GlobalApiResponse;
import com.example.dapdap.users.entity.User;
import com.example.dapdap.users.repository.UserRepository;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.example.dapdap.users.dto.response.NicknameAvailabilityResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final GithubOauthService githubOauthService;
    private final GoogleOauthService googleOauthService;
    private final UserRepository userRepository;

    // ============================================================
    // 회원가입
    // ============================================================
    @PostMapping("/signup")
    public GlobalApiResponse<Void> signup(@RequestBody SignupRequest request) {

        authService.signup(request);
        return GlobalApiResponse.ok("회원가입 완료", null);
    }

    @GetMapping("/nickname-available")
    public GlobalApiResponse<NicknameAvailabilityResponse> checkNicknameAvailable(
            @RequestParam String nickname
    ) {
        boolean available = authService.isNicknameAvailable(nickname);
        return GlobalApiResponse.ok(new NicknameAvailabilityResponse(available));
    }

    // ============================================================
    // 로그인
    // ============================================================
    @PostMapping("/login")
    public GlobalApiResponse<LoginResponse> login(
            @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        User user = authService.login(request.getEmail(), request.getPassword());

        String role = user.getRole().getAuthority();
        String access = jwtUtil.createAccessToken(user.getEmail(), role);
        String refresh = jwtUtil.createRefreshToken(user.getEmail(), role);

        authService.saveRefreshToken(user.getEmail(), refresh);

        // refresh cookie
        Cookie cookie = new Cookie("refresh", refresh);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        // 운영에서는 cookie.setSecure(true), SameSite 설정 고려 필요
        response.addCookie(cookie);

        // access header
        response.setHeader("Authorization", "Bearer " + access);

        LoginResponse loginResponse = new LoginResponse(
                user.getId(),                 // userId
                user.getEmail(),
                user.getNickname(),
                user.getRole().getAuthority(),
                access,
                user.getProfileUrl(),
                user.getSocialType()
        );

        return GlobalApiResponse.ok(loginResponse);
    }

    // ============================================================
    // 토큰 재발급
    // ============================================================
    @PostMapping("/reissue")
    public GlobalApiResponse<Void> reissue(HttpServletRequest request, HttpServletResponse response) {
        String refresh = extractRefreshTokenFromCookie(request);

        // 1) 토큰 검증
        try {
            jwtUtil.validateToken(refresh);
        } catch (ExpiredJwtException e) {
            throw new CustomException(ErrorCode.UNAUTHORIZED, "리프레시 토큰이 만료되었습니다.");
        } catch (JwtException | IllegalArgumentException e) {
            throw new CustomException(ErrorCode.UNAUTHORIZED, "리프레시 토큰이 유효하지 않습니다.");
        }

        // 2) refresh 토큰인지 확인
        if (!"refresh".equals(jwtUtil.getCategory(refresh))) {
            throw new CustomException(ErrorCode.UNAUTHORIZED, "올바른 리프레시 토큰이 아닙니다.");
        }

        String email = jwtUtil.getUsername(refresh);
        String role = jwtUtil.getRole(refresh);

        // 3) DB 저장 토큰과 일치하는지 확인
        String saved = authService.findRefreshToken(email);
        if (saved == null || !refresh.equals(saved)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED, "리프레시 토큰이 유효하지 않습니다.");
        }

        // 4) 재발급
        String newAccess = jwtUtil.createAccessToken(email, role);
        String newRefresh = jwtUtil.createRefreshToken(email, role);
        authService.saveRefreshToken(email, newRefresh);

        Cookie cookie = new Cookie("refresh", newRefresh);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        response.addCookie(cookie);

        response.setHeader("Authorization", "Bearer " + newAccess);

        return GlobalApiResponse.ok("토큰이 재발급되었습니다.", null);
    }

    // ============================================================
    // 로그아웃
    // ============================================================
    @PostMapping("/logout")
    public GlobalApiResponse<Void> logout(HttpServletRequest request, HttpServletResponse response) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED, "인증 정보가 없습니다.");
        }

        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        String email = userDetails.getUsername();

        authService.logout(email);

        Cookie cookie = new Cookie("refresh", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        return GlobalApiResponse.ok("로그아웃 완료", null);
    }

    // ============================================================
    // 비밀번호 초기화 요청 (인증코드 발송)
    // ============================================================
    @PostMapping("/password/reset")
    public GlobalApiResponse<Void> requestPasswordReset(@RequestBody PasswordResetEmailRequest req) {
        authService.sendResetPasswordMail(req.getEmail());
        return GlobalApiResponse.ok("이메일로 인증 코드가 발송되었습니다.", null);
    }

    // ============================================================
    // 비밀번호 초기화 확인 (임시 비밀번호 발송)
    // ============================================================
    @PostMapping("/password/reset-confirm")
    public GlobalApiResponse<Void> confirmPasswordReset(@RequestBody PasswordResetConfirmRequest req) {
        authService.resetPassword(req.getEmail(), req.getCode());
        return GlobalApiResponse.ok("임시 비밀번호가 이메일로 전송되었습니다.", null);
    }

    // ============================================================
    // Utils
    // ============================================================
    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            throw new CustomException(ErrorCode.UNAUTHORIZED, "리프레시 토큰이 없습니다.");
        }

        for (Cookie c : cookies) {
            if ("refresh".equals(c.getName())) {
                String value = c.getValue();
                if (value == null || value.isBlank()) {
                    throw new CustomException(ErrorCode.UNAUTHORIZED, "리프레시 토큰이 없습니다.");
                }
                return value;
            }
        }

        throw new CustomException(ErrorCode.UNAUTHORIZED, "리프레시 토큰이 없습니다.");
    }

    @PostMapping("/github/doLogin")
    public GlobalApiResponse<LoginResponse> githubLogin(@RequestBody RedirectDto redirectDto, HttpServletResponse response){
        GithubAccessTokenDto accessTokenDto = githubOauthService.getAccessToken(redirectDto.getCode());
        String accessToken = accessTokenDto.getAccess_token();

        GithubProfileDto githubProfileDto = githubOauthService.getGithubProfile(accessToken);

        String socialId = String.valueOf(githubProfileDto.getId());

        String email = githubOauthService.getPrimaryEmail(accessToken);

        if(email == null){
            throw new CustomException(ErrorCode.INVALID_PARAMETER, "GitHub primary email 없음");
        }

        User user = userRepository.findBySocialTypeAndSocialId("GITHUB", socialId)
                .orElseGet(() -> userRepository.findByEmail(email)
                        .map(existing -> {
                            existing.linkSocial("GITHUB", socialId);
                            return userRepository.save(existing);
                        })
                        .orElseGet(() -> {
                            String nickname = githubProfileDto.getLogin() != null ? githubProfileDto.getLogin() : "github_" + socialId;
                            User newUser = User.builder()
                                    .email(email)
                                    .password(null)
                                    .nickname(nickname)
                                    .role(Role.USER)
                                    .status(UserStatus.ACTIVE)
                                    .socialType("GITHUB")
                                    .socialId(socialId)
                                    .profileUrl(githubProfileDto.getAvatar_url())
                                    .build();
                            return userRepository.save(newUser);
                        })
                );

        String role = user.getRole().getAuthority();
        String access = jwtUtil.createAccessToken(user.getEmail(), role);
        String refresh = jwtUtil.createRefreshToken(user.getEmail(), role);
        authService.saveRefreshToken(user.getEmail(), refresh);

        Cookie cookie = new Cookie("refresh", refresh);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        response.addCookie(cookie);
        response.setHeader("Authorization", "Bearer " + access);

        LoginResponse loginResponse = new LoginResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getRole().getAuthority(),
                access,
                user.getProfileUrl(),
                user.getSocialType()
        );

        return GlobalApiResponse.ok(loginResponse);
    }

    @PostMapping("/google/doLogin")
    public GlobalApiResponse<LoginResponse> googleLogin(@RequestBody RedirectDto redirectDto, HttpServletResponse response){
        GoogleAccessTokenDto googleAccessTokenDto = googleOauthService.getAccessToken(redirectDto.getCode());

        GoogleProfileDto googleProfileDto = googleOauthService.getGoogleProfile(googleAccessTokenDto.getAccess_token());
        String socialId = googleProfileDto.getSub();
        String email = googleProfileDto.getEmail();

        if(email == null){
            throw new CustomException(ErrorCode.INVALID_PARAMETER, "Google email 없음");
        }

        User user = userRepository.findBySocialTypeAndSocialId("GOOGLE", socialId)
                .orElseGet(() -> userRepository.findByEmail(email)
                        .map(existing -> {
                            existing.linkSocial("GOOGLE", socialId);
                            return userRepository.save(existing);
                        })
                        .orElseGet(() -> {
                            String nickname = googleProfileDto.getName() != null ? googleProfileDto.getName() : "google_" + socialId;
                            User newUser = User.builder()
                                    .email(email)
                                    .password(null)
                                    .nickname(nickname)
                                    .role(Role.USER)
                                    .status(UserStatus.ACTIVE)
                                    .socialType("GOOGLE")
                                    .socialId(socialId)
                                    .profileUrl(googleProfileDto.getPicture())
                                    .build();
                            return userRepository.save(newUser);
                        })
                );


        String role = user.getRole().getAuthority();
        String access = jwtUtil.createAccessToken(user.getEmail(), role);
        String refresh = jwtUtil.createRefreshToken(user.getEmail(), role);
        authService.saveRefreshToken(user.getEmail(), refresh);

        Cookie cookie = new Cookie("refresh", refresh);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        response.addCookie(cookie);
        response.setHeader("Authorization", "Bearer " + access);

        LoginResponse loginResponse = new LoginResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getRole().getAuthority(),
                access,
                user.getProfileUrl(),
                user.getSocialType()
        );

        return GlobalApiResponse.ok(loginResponse);
    }
}
