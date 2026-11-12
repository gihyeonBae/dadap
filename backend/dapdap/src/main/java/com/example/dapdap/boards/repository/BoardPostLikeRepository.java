package com.example.dapdap.boards.repository;

import com.example.dapdap.boards.entity.BoardPostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BoardPostLikeRepository extends JpaRepository<BoardPostLike, Long> {
    Optional<BoardPostLike> findByPost_IdAndUser_Id(Long postId, Long userId);
    boolean existsByPost_IdAndUser_Id(Long postId, Long userId);
    List<BoardPostLike> findByPost_IdInAndUser_Id(List<Long> postIds, Long userId);

    @Query("""
        select l from BoardPostLike l
        join fetch l.post p
        join fetch p.author
        where l.user.id = :userId
        order by l.createdAt desc
    """)
    List<BoardPostLike> findByUserIdWithPostOrderByCreatedAtDesc(@Param("userId") Long userId);
}
