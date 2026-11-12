package com.example.dapdap.boards.repository;

import com.example.dapdap.boards.entity.BoardComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BoardCommentRepository extends JpaRepository<BoardComment, Long> {
    List<BoardComment> findByPost_IdOrderByCreatedAtAsc(Long postId);

    @Query("""
        select c.post.id, count(c)
        from BoardComment c
        where c.post.id in :postIds
        group by c.post.id
    """)
    List<Object[]> countByPostIds(@Param("postIds") List<Long> postIds);
}
