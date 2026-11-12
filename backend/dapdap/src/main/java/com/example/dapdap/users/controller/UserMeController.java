package com.example.dapdap.users.controller;

import com.example.dapdap.auth.domain.CustomUserDetails;
import com.example.dapdap.global.response.GlobalApiResponse;
import com.example.dapdap.users.dto.request.PasswordChangeRequest;
import com.example.dapdap.users.dto.request.UpdateMeRequest;
import com.example.dapdap.users.dto.request.DeleteMeRequest;
import com.example.dapdap.users.dto.response.NicknameAvailabilityResponse;
import com.example.dapdap.users.dto.response.PasswordChangeResponse;
import com.example.dapdap.users.dto.response.ProfileImageResponse;
import com.example.dapdap.users.dto.response.UserMeResponse;
import com.example.dapdap.users.dto.response.UserProfileUpdateResponse;
import com.example.dapdap.users.dto.response.MyPageSummaryResponse;
import com.example.dapdap.users.service.UserMeService;
import com.example.dapdap.boards.dto.response.BoardMyPostListResponse;
import com.example.dapdap.boards.service.BoardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users/me")
public class UserMeController {

    private final UserMeService userMeService;
    private final BoardService boardService;

    @GetMapping
    public GlobalApiResponse<UserMeResponse> getMe(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return GlobalApiResponse.ok(userMeService.getMe(userDetails));
    }

    @GetMapping("/summary")
    public GlobalApiResponse<MyPageSummaryResponse> getMyPageSummary(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return GlobalApiResponse.ok(userMeService.getMyPageSummary(userDetails));
    }

    @GetMapping("/nickname-available")
    public GlobalApiResponse<NicknameAvailabilityResponse> checkNicknameAvailable(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam String nickname
    ) {
        boolean available = userMeService.isNicknameAvailable(userDetails, nickname);
        return GlobalApiResponse.ok(new NicknameAvailabilityResponse(available));
    }

    @GetMapping("/boards")
    public GlobalApiResponse<BoardMyPostListResponse> getMyBoards(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "mine") String type
    ) {
        String normalized = normalizeMyBoardType(type);
        return GlobalApiResponse.ok(boardService.listMyPagePosts(normalized, userDetails.getUser()));
    }

    @PatchMapping
    public GlobalApiResponse<UserProfileUpdateResponse> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UpdateMeRequest request
    ) {
        return GlobalApiResponse.ok(userMeService.updateProfile(userDetails, request));
    }

    @PostMapping("/profile-image")
    public GlobalApiResponse<ProfileImageResponse> uploadProfileImage(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestPart MultipartFile file
    ) {
        return GlobalApiResponse.ok(userMeService.uploadProfileImage(userDetails, file));
    }

    @DeleteMapping("/profile-image")
    public GlobalApiResponse<ProfileImageResponse> deleteProfileImage(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return GlobalApiResponse.ok(userMeService.deleteProfileImage(userDetails));
    }

    @PatchMapping("/password")
    public GlobalApiResponse<PasswordChangeResponse> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody PasswordChangeRequest request
    ) {
        return GlobalApiResponse.ok(userMeService.changePassword(userDetails, request));
    }

    @DeleteMapping
    public GlobalApiResponse<Void> deleteMe(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody(required = false) DeleteMeRequest request
    ) {
        userMeService.deleteMe(userDetails, request);
        return GlobalApiResponse.ok("Account deleted.", null);
    }

    private String normalizeMyBoardType(String type) {
        String value = type == null ? "mine" : type.trim().toLowerCase();
        return "liked".equals(value) ? "liked" : "mine";
    }
}
