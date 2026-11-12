import { useState, useEffect } from 'react';
import { boardsService, type BoardListItem } from '../../../api/myBoardsService';

export const useMyStories = () => {
  const [posts, setPosts] = useState<BoardListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCurrentUser = () => {
    try {
      const _ui = localStorage.getItem('userInfo');
      const parsed = _ui ? JSON.parse(_ui) : null;
      return parsed?.nickname || localStorage.getItem('username') || '';
    } catch (e) {
      return localStorage.getItem('username') || '';
    }
  };

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await boardsService.getBoards();
        const currentUser = getCurrentUser();
        const myPosts = Array.isArray(data.posts)
          ? data.posts.filter(p => String(p.authorName || '').trim() === String(currentUser || '').trim())
          : [];
        setPosts(myPosts);
      } catch (err) {
        console.error('[MyStories] getBoards 에러:', err);
        setError('내가 쓴 글을 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  return {
    posts,
    isLoading,
    error
  };
};
