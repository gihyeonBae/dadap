package com.example.dapdap.boards.controller;

import com.example.dapdap.auth.domain.CustomUserDetails;
import com.example.dapdap.boards.dto.request.CreateBoardCommentRequest;
import com.example.dapdap.boards.dto.request.CreateBoardPostRequest;
import com.example.dapdap.boards.dto.request.UpdateBoardPostRequest;
import com.example.dapdap.boards.dto.response.BoardCommentResponse;
import com.example.dapdap.boards.dto.response.BoardPostActionResponse;
import com.example.dapdap.boards.dto.response.BoardPostDetailResponse;
import com.example.dapdap.boards.dto.response.BoardPostListResponse;
import com.example.dapdap.boards.service.BoardService;
import com.example.dapdap.global.response.GlobalApiResponse;
import com.example.dapdap.users.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/boards")
public class BoardController {

    private final BoardService boardService;

    @GetMapping
    public GlobalApiResponse<BoardPostListResponse> list(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false, defaultValue = "latest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        String normalized = normalizeSort(sort);
        User user = userDetails != null ? userDetails.getUser() : null;
        return GlobalApiResponse.ok(boardService.listPosts(normalized, page, size, user));
    }

    @PostMapping
    public GlobalApiResponse<BoardPostDetailResponse> create(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestPart CreateBoardPostRequest req,
            @RequestPart(required = false) MultipartFile imageFile
    ) {
        User user = userDetails.getUser();
        return GlobalApiResponse.created("게시글이 생성되었습니다", boardService.createPost(user, req, imageFile));
    }

    @GetMapping("/{postId}")
    public GlobalApiResponse<BoardPostDetailResponse> get(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long postId
    ) {
        User user = userDetails != null ? userDetails.getUser() : null;
        return GlobalApiResponse.ok(boardService.getPost(postId, true, user));
    }

    @PatchMapping("/{postId}")
    public GlobalApiResponse<BoardPostDetailResponse> update(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long postId,
            @RequestPart UpdateBoardPostRequest req,
            @RequestPart(required = false) MultipartFile imageFile
    ) {
        User user = userDetails.getUser();
        return GlobalApiResponse.ok(boardService.updatePost(postId, user, req, imageFile));
    }

    @DeleteMapping("/{postId}")
    public GlobalApiResponse<Void> delete(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long postId
    ) {
        User user = userDetails.getUser();
        boardService.deletePost(postId, user);
        return GlobalApiResponse.noContent("게시글이 삭제되었습니다");
    }

    @PostMapping("/{postId}/like")
    public GlobalApiResponse<BoardPostActionResponse> like(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long postId
    ) {
        User user = userDetails.getUser();
        return GlobalApiResponse.ok(boardService.toggleLike(postId, user));
    }

    @PostMapping("/{postId}/comments")
    public GlobalApiResponse<BoardCommentResponse> addComment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long postId,
            @RequestBody CreateBoardCommentRequest req
    ) {
        User user = userDetails.getUser();
        return GlobalApiResponse.ok(boardService.addComment(postId, user, req));
    }

    @DeleteMapping("/{postId}/comments/{commentId}")
    public GlobalApiResponse<Void> deleteComment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long postId,
            @PathVariable Long commentId
    ) {
        User user = userDetails.getUser();
        boardService.deleteComment(postId, commentId, user);
        return GlobalApiResponse.noContent("댓글이 삭제되었습니다");
    }

    private String normalizeSort(String sort) {
        String value = sort == null ? "latest" : sort.trim().toLowerCase();
        return switch (value) {
            case "likes", "views" -> value;
            default -> "latest";
        };
    }
}

