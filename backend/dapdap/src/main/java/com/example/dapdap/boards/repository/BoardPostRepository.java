package com.example.dapdap.boards.repository;

import com.example.dapdap.boards.entity.BoardPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BoardPostRepository extends JpaRepository<BoardPost, Long> {
    List<BoardPost> findAllByOrderByCreatedAtDesc();

    List<BoardPost> findAllByOrderByLikesDescCreatedAtDesc();

    List<BoardPost> findAllByOrderByViewsDescCreatedAtDesc();

    Page<BoardPost> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<BoardPost> findAllByOrderByLikesDescCreatedAtDesc(Pageable pageable);

    Page<BoardPost> findAllByOrderByViewsDescCreatedAtDesc(Pageable pageable);

    @Query("""
        select p from BoardPost p
        join fetch p.author
        where p.author.id = :userId
        order by p.createdAt desc
    """)
    List<BoardPost> findByAuthorIdWithAuthorOrderByCreatedAtDesc(@Param("userId") Long userId);
}
