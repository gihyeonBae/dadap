package com.example.dapdap.boards.service;

import com.example.dapdap.boards.dto.request.CreateBoardCommentRequest;
import com.example.dapdap.boards.dto.request.CreateBoardPostRequest;
import com.example.dapdap.boards.dto.request.UpdateBoardPostRequest;
import com.example.dapdap.boards.dto.response.BoardCommentResponse;
import com.example.dapdap.boards.dto.response.BoardMyPostListItemResponse;
import com.example.dapdap.boards.dto.response.BoardMyPostListResponse;
import com.example.dapdap.boards.dto.response.BoardPostActionResponse;
import com.example.dapdap.boards.dto.response.BoardPostDetailResponse;
import com.example.dapdap.boards.dto.response.BoardPostListItemResponse;
import com.example.dapdap.boards.dto.response.BoardPostListResponse;
import com.example.dapdap.boards.entity.BoardComment;
import com.example.dapdap.boards.entity.BoardPost;
import com.example.dapdap.boards.entity.BoardPostLike;
import com.example.dapdap.boards.repository.BoardCommentRepository;
import com.example.dapdap.boards.repository.BoardPostLikeRepository;
import com.example.dapdap.boards.repository.BoardPostRepository;
import com.example.dapdap.storage.service.S3KeyFactory;
import com.example.dapdap.storage.service.S3UploadService;
import com.example.dapdap.users.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.beans.factory.annotation.Value;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BoardService {

    private static final long MAX_IMAGE_BYTES = 5L * 1024 * 1024;
    private static final int EXCERPT_LIMIT = 120;

    private final BoardPostRepository postRepository;
    private final BoardCommentRepository commentRepository;
    private final BoardPostLikeRepository likeRepository;
    private final S3UploadService uploadService;
    private final S3KeyFactory keyFactory;

    @Value("${app.s3.bucket}")
    private String bucket;

    @Value("${app.s3.region}")
    private String region;

    @Transactional(readOnly = true)
    public BoardPostListResponse listPosts(String sort, int page, int size, User user) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BoardPost> result = switch (sort) {
            case "likes" -> postRepository.findAllByOrderByLikesDescCreatedAtDesc(pageable);
            case "views" -> postRepository.findAllByOrderByViewsDescCreatedAtDesc(pageable);
            case null, default -> postRepository.findAllByOrderByCreatedAtDesc(pageable);
        };

        List<BoardPost> posts = result.getContent();
        List<Long> postIds = posts.stream().map(BoardPost::getId).toList();
        var likedPostIds = resolveLikedPostIds(postIds, user);

        List<BoardPostListItemResponse> items = posts
                .stream()
                .map(p -> new BoardPostListItemResponse(
                        p.getId(),
                        p.getTitle(),
                        p.getAuthor().getNickname(),
                        p.getAuthor().getProfileUrl(),
                        p.getViews(),
                        p.getLikes(),
                        likedPostIds.contains(p.getId()),
                        p.getCreatedAt(),
                        p.getUpdatedAt()
                ))
                .toList();
        return new BoardPostListResponse(
                items,
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public BoardMyPostListResponse listMyPagePosts(String type, User user) {
        if ("liked".equals(type)) {
            return listLikedPosts(user);
        }
        return listMyPosts(user);
    }

    @Transactional(readOnly = true)
    public BoardMyPostListResponse listMyPosts(User user) {
        List<BoardPost> posts = postRepository.findByAuthorIdWithAuthorOrderByCreatedAtDesc(user.getId());
        List<Long> postIds = posts.stream().map(BoardPost::getId).toList();
        Map<Long, Long> commentCounts = resolveCommentCounts(postIds);
        java.util.Set<Long> likedPostIds = resolveLikedPostIds(postIds, user);
        return toMyPostList("mine", posts, commentCounts, likedPostIds, null);
    }

    @Transactional(readOnly = true)
    public BoardMyPostListResponse listLikedPosts(User user) {
        List<BoardPostLike> likes = likeRepository.findByUserIdWithPostOrderByCreatedAtDesc(user.getId());
        List<BoardPost> posts = likes.stream().map(BoardPostLike::getPost).toList();
        List<Long> postIds = posts.stream().map(BoardPost::getId).toList();
        Map<Long, Long> commentCounts = resolveCommentCounts(postIds);
        Map<Long, java.time.LocalDateTime> likedAtMap = new HashMap<>();
        for (BoardPostLike like : likes) {
            likedAtMap.put(like.getPost().getId(), like.getCreatedAt());
        }
        return toMyPostList("liked", posts, commentCounts, likedAtMap.keySet(), likedAtMap);
    }

    @Transactional
    public BoardPostDetailResponse createPost(User user, CreateBoardPostRequest req, MultipartFile imageFile) {
        BoardPost post = new BoardPost(
                req.getTitle(),
                req.getContent(),
                null,
                user
        );
        BoardPost saved = postRepository.save(post);

        if (imageFile != null && !imageFile.isEmpty()) {
            validateImage(imageFile);
            String key = keyFactory.boardImageKey(user.getId(), saved.getId(), imageFile.getOriginalFilename());
            uploadService.upload(imageFile, key);
            String imageUrl = buildPublicUrl(key);
            saved.update(saved.getTitle(), saved.getContent(), imageUrl);
        }
        return toDetailResponse(saved, false, List.of());
    }

    @Transactional
    public BoardPostDetailResponse getPost(Long postId, boolean increaseViews, User user) {
        BoardPost post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("post not found. id=" + postId));

        if (increaseViews) {
            post.increaseViews();
        }

        List<BoardComment> comments = commentRepository.findByPost_IdOrderByCreatedAtAsc(postId);
        List<BoardCommentResponse> commentTree = buildCommentTree(comments);

        boolean liked = isLiked(postId, user);
        return toDetailResponse(post, liked, commentTree);
    }

    @Transactional
    public BoardPostDetailResponse updatePost(Long postId, User user, UpdateBoardPostRequest req, MultipartFile imageFile) {
        BoardPost post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("post not found. id=" + postId));

        if (!post.getAuthor().getId().equals(user.getId())) {
            throw new IllegalArgumentException("no permission to update. postId=" + postId);
        }

        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            validateImage(imageFile);
            String key = keyFactory.boardImageKey(user.getId(), post.getId(), imageFile.getOriginalFilename());
            uploadService.upload(imageFile, key);
            imageUrl = buildPublicUrl(key);
        }

        post.update(req.getTitle(), req.getContent(), imageUrl);
        List<BoardComment> comments = commentRepository.findByPost_IdOrderByCreatedAtAsc(postId);
        boolean liked = isLiked(postId, user);
        return toDetailResponse(post, liked, buildCommentTree(comments));
    }

    @Transactional
    public void deletePost(Long postId, User user) {
        BoardPost post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("post not found. id=" + postId));

        if (!post.getAuthor().getId().equals(user.getId())) {
            throw new IllegalArgumentException("no permission to delete. postId=" + postId);
        }

        postRepository.delete(post);
    }

    @Transactional
    public BoardPostActionResponse toggleLike(Long postId, User user) {
        BoardPost post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("post not found. id=" + postId));

        boolean liked;
        var existing = likeRepository.findByPost_IdAndUser_Id(postId, user.getId());
        if (existing.isPresent()) {
            likeRepository.delete(existing.get());
            post.decreaseLikes();
            liked = false;
        } else {
            likeRepository.save(new BoardPostLike(post, user));
            post.increaseLikes();
            liked = true;
        }
        return new BoardPostActionResponse(post.getId(), post.getViews(), post.getLikes(), liked);
    }

    @Transactional
    public BoardCommentResponse addComment(Long postId, User user, CreateBoardCommentRequest req) {
        BoardPost post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("post not found. id=" + postId));

        BoardComment parent = null;
        if (req.getParentCommentId() != null) {
            parent = commentRepository.findById(req.getParentCommentId())
                    .orElseThrow(() -> new IllegalArgumentException("parent comment not found. id=" + req.getParentCommentId()));
            if (!parent.getPost().getId().equals(postId)) {
                throw new IllegalArgumentException("parent comment does not belong to post. postId=" + postId);
            }
        }

        BoardComment comment = new BoardComment(post, parent, user, req.getContent());
        BoardComment saved = commentRepository.save(comment);
        return new BoardCommentResponse(
                saved.getId(),
                parent != null ? parent.getId() : null,
                saved.getAuthor().getNickname(),
                saved.getAuthor().getProfileUrl(),
                saved.getContent(),
                saved.getCreatedAt(),
                List.of()
        );
    }

    @Transactional
    public void deleteComment(Long postId, Long commentId, User user) {
        BoardComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("comment not found. id=" + commentId));

        if (!comment.getPost().getId().equals(postId)) {
            throw new IllegalArgumentException("comment does not belong to post. postId=" + postId);
        }

        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new IllegalArgumentException("no permission to delete comment. commentId=" + commentId);
        }

        commentRepository.delete(comment);
    }

    private BoardPostDetailResponse toDetailResponse(BoardPost post, boolean liked, List<BoardCommentResponse> comments) {
        return new BoardPostDetailResponse(
                post.getId(),
                post.getTitle(),
                post.getAuthor().getNickname(),
                post.getAuthor().getProfileUrl(),
                post.getContent(),
                post.getImageUrl(),
                post.getViews(),
                post.getLikes(),
                liked,
                post.getCreatedAt(),
                post.getUpdatedAt(),
                comments
        );
    }

    private BoardMyPostListResponse toMyPostList(
            String type,
            List<BoardPost> posts,
            Map<Long, Long> commentCounts,
            java.util.Set<Long> likedPostIds,
            Map<Long, java.time.LocalDateTime> likedAtMap
    ) {
        List<BoardMyPostListItemResponse> items = posts.stream()
                .map(p -> new BoardMyPostListItemResponse(
                        p.getId(),
                        p.getTitle(),
                        buildExcerpt(p.getContent()),
                        p.getAuthor().getNickname(),
                        p.getImageUrl(),
                        p.getViews(),
                        p.getLikes(),
                        commentCounts.getOrDefault(p.getId(), 0L),
                        likedPostIds.contains(p.getId()),
                        p.getCreatedAt(),
                        p.getUpdatedAt(),
                        likedAtMap != null ? likedAtMap.get(p.getId()) : null
                ))
                .toList();
        return new BoardMyPostListResponse(type, items);
    }

    private boolean isLiked(Long postId, User user) {
        if (user == null) {
            return false;
        }
        return likeRepository.existsByPost_IdAndUser_Id(postId, user.getId());
    }

    private java.util.Set<Long> resolveLikedPostIds(List<Long> postIds, User user) {
        if (user == null || postIds.isEmpty()) {
            return java.util.Set.of();
        }
        return likeRepository.findByPost_IdInAndUser_Id(postIds, user.getId())
                .stream()
                .map(like -> like.getPost().getId())
                .collect(java.util.stream.Collectors.toSet());
    }

    private Map<Long, Long> resolveCommentCounts(List<Long> postIds) {
        if (postIds == null || postIds.isEmpty()) {
            return Map.of();
        }
        Map<Long, Long> counts = new HashMap<>();
        for (Object[] row : commentRepository.countByPostIds(postIds)) {
            Long postId = (Long) row[0];
            Long count = (Long) row[1];
            counts.put(postId, count);
        }
        return counts;
    }

    private String buildExcerpt(String content) {
        if (content == null) {
            return null;
        }
        String value = content.strip();
        if (value.length() <= EXCERPT_LIMIT) {
            return value;
        }
        return value.substring(0, EXCERPT_LIMIT) + "...";
    }

    private List<BoardCommentResponse> buildCommentTree(List<BoardComment> comments) {
        Map<Long, BoardCommentResponse> mapped = new HashMap<>();
        Map<Long, List<BoardCommentResponse>> childrenMap = new HashMap<>();
        List<BoardCommentResponse> roots = new ArrayList<>();

        for (BoardComment comment : comments) {
            BoardCommentResponse res = new BoardCommentResponse(
                    comment.getId(),
                    comment.getParent() != null ? comment.getParent().getId() : null,
                    comment.getAuthor().getNickname(),
                    comment.getAuthor().getProfileUrl(),
                    comment.getContent(),
                    comment.getCreatedAt(),
                    new ArrayList<>()
            );
            mapped.put(comment.getId(), res);
            Long parentId = res.getParentCommentId();
            if (parentId == null) {
                roots.add(res);
            } else {
                childrenMap.computeIfAbsent(parentId, k -> new ArrayList<>()).add(res);
            }
        }

        for (Map.Entry<Long, List<BoardCommentResponse>> entry : childrenMap.entrySet()) {
            BoardCommentResponse parent = mapped.get(entry.getKey());
            if (parent != null) {
                parent.getReplies().addAll(entry.getValue());
            }
        }

        return roots;
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("image file is required.");
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/png") && !contentType.equals("image/jpeg"))) {
            throw new IllegalArgumentException("only PNG/JPEG images are allowed.");
        }

        if (file.getSize() > MAX_IMAGE_BYTES) {
            throw new IllegalArgumentException("image must be 5MB or less.");
        }
    }

    private String buildPublicUrl(String key) {
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucket, region, key);
    }
}
