import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getLikedPosts, removeLikedPost } from '../../../utils/myPageStore';
import { boardsService } from '../../../api/myBoardsService';
import { selectAllPosts, setPosts } from '../../../redux/slices/studySlice';
import { PAGE_SIZE } from './LikedPosts.constants';
import type { LikedPost } from './LikedPosts.types';

export const useLikedPosts = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const reduxPosts = useSelector(selectAllPosts);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<LikedPost[]>([]);

  // load liked board posts from backend (DB) and merge with locally stored study likes
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Fetch first page of boards and filter liked by current user
        const data = await boardsService.getBoards();
        const boardLiked = (data.posts || []).filter(p => Boolean(p.liked)).map(p => ({
          id: p.postId,
          type: 'board' as const,
          title: p.title,
          author: p.authorName,
          date: p.createdAt?.slice(0,10),
          likes: p.likes,
        }));
        // Also include study likes from localStorage for now
        const localStudy = getLikedPosts().filter(p => p.type === 'study');
        if (!mounted) return;
        setItems([...boardLiked, ...localStudy]);
      } catch (e) {
        console.error('[useLikedPosts] failed to load liked boards from backend', e);
        // fallback to local storage
        setItems(getLikedPosts());
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const handler = async () => {
      try {
        // refresh backend-backed board likes and merge with local study likes
        const data = await boardsService.getBoards();
        const boardLiked = (data.posts || []).filter(p => Boolean(p.liked)).map(p => ({
          id: p.postId,
          type: 'board' as const,
          title: p.title,
          author: p.authorName,
          date: p.createdAt?.slice(0,10),
          likes: p.likes,
        }));
        const localStudy = getLikedPosts().filter(p => p.type === 'study');
        setItems([...boardLiked, ...localStudy]);
      } catch (e) {
        console.error('[useLikedPosts] likedUpdated refresh failed', e);
        setItems(getLikedPosts());
      }
    };
    window.addEventListener('myPage:likedUpdated', handler as EventListener);
    return () => window.removeEventListener('myPage:likedUpdated', handler as EventListener);
  }, []);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  const pagedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);

  const handleRemove = async (id: number, type: string) => {
    try {
      if (type === 'board') {
        // call backend to toggle like off
        try {
          const res = await boardsService.likeBoard(id);
          // remove from items list
          setItems(prev => prev.filter(it => !(it.type === 'board' && it.id === id)));
          // ensure local store consistency
          removeLikedPost(id, 'board');
        } catch (e) {
          console.error('[useLikedPosts] failed to unlike board on backend', e);
        }
      } else {
        removeLikedPost(id, type as any);
        setItems(getLikedPosts());
        if (type === 'study' && reduxPosts && reduxPosts.length) {
          const updated = reduxPosts.map((p: any) => 
            p.id === id ? { ...p, isLiked: false, likes: Math.max(0, (p.likes || 0) - 1) } : p
          );
          dispatch(setPosts(updated));
        }
      }
    } catch (e) {
      console.error('Failed to remove liked post', e);
    }
  };

  const handleView = (id: number, type: string) => {
    if (type === 'study') navigate(`/study/post/${id}`);
    else navigate(`/community/${id}`);
  };

  return {
    items,
    pagedItems,
    page,
    totalPages,
    setPage,
    handleRemove,
    handleView
  };
};
