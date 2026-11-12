import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllPosts, selectCurrentCategory, setPosts, toggleLike } from '../../../redux/slices/studySlice';
import { interviewService } from '../../../api/interviewService';
import { incrementViewCount } from '../viewUtils';
import type { StudyPost } from './StudyDetail.types';
import type { LocationState } from './StudyDetail.types';

export const useStudyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | undefined;
  
  const dispatch = useDispatch();
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [scrapLoading, setScrapLoading] = useState(false);
  const [isScrapped, setIsScrapped] = useState(false);
  const [showFollowUps, setShowFollowUps] = useState(false);
  const initRef = useRef(false);

  const posts = useSelector(selectAllPosts);
  const currentCategory = useSelector(selectCurrentCategory);
  
  const post = posts.find((p: StudyPost) => p.id === Number(id));

  const handleBackToList = () => {
    const categoryToUse = locationState?.category || currentCategory || 'all';
    const target = String(categoryToUse).toLowerCase();
    const page = locationState?.page ?? 0;
    navigate(`/study/category/${target}?page=${page}`);
  };

  const handleToggleLike = async () => {
    if (!post) return;
    const newLiked = !post.isLiked;
    dispatch(toggleLike(post.id));

    try {
      const likedPost = {
        id: post.id,
        type: 'study' as const,
        title: post.title,
        author: post.author,
        date: post.date,
        likes: newLiked ? (post.likes + 1) : (post.likes - 1),
      };
      if (newLiked) {
        const { addLikedPost } = await import('../../../utils/myPageStore');
        addLikedPost(likedPost);
      } else {
        const { removeLikedPost } = await import('../../../utils/myPageStore');
        removeLikedPost(post.id, 'study');
      }
    } catch (e) {
      console.error('Failed persisting liked post to localStorage', e);
    }
  };

  useEffect(() => {
    const qid = Number(id);
    if (!qid) return;
    if (initRef.current) return;

    (async () => {
      try {
        // Ensure we check server-side scrapped questions (DB) instead of relying on localStorage
        try {
          const res = await interviewService.getScrappedQuestions({ page: 0, size: 1000 });
          const body = (res as any).data ?? res;
          let items: any[] = [];
          if (Array.isArray(body)) items = body;
          else if (Array.isArray(body?.data)) items = body.data;
          else if (Array.isArray(body?.items)) items = body.items;
          else if (Array.isArray(body?.data?.items)) items = body.data.items;
          else items = body?.items ?? body?.data ?? [];
          const found = items.some(it => Number(it?.questionId) === qid);
          setIsScrapped(Boolean(found));
          // populate in-memory store for other components
          try {
            const { refreshSavedProblems } = await import('../../../utils/myPageStore');
            if (typeof refreshSavedProblems === 'function') await refreshSavedProblems(0, 20);
          } catch (e) { /* ignore */ }
        } catch (e) { console.error('init saved check (server) failed', e); }

        const existing = posts.find((p: any) => p.id === qid);
        if (existing) {
          try {
            const { getLikedPosts } = await import('../../../utils/myPageStore');
            const liked = getLikedPosts().some(l => Number(l.id) === qid && l.type === 'study');
            if (liked && !existing.isLiked) {
              const updated = posts.map((p: any) => p.id === qid ? { ...p, isLiked: true, likes: (p.likes || 0) + 1 } : p);
              dispatch(setPosts(updated));
            }
          } catch (e) { console.error('init liked check failed', e); }

          initRef.current = true;
        }
      } catch (e) {
        console.error('failed to init mypage state', e);
        initRef.current = true;
      }
    })();
  }, [id, posts, dispatch]);

  useEffect(() => {
    const savedHandler = async () => {
      const qid = Number(id);
      if (!qid) return;
      try {
        const { getSavedProblems } = await import('../../../utils/myPageStore');
        const saved = getSavedProblems().some(s => Number(s.id) === qid);
        setIsScrapped(Boolean(saved));
      } catch (e) { console.error('savedUpdated handler failed', e); }
    };

    const likedHandler = async () => {
      const qid = Number(id);
      if (!qid) return;
      try {
        const { getLikedPosts } = await import('../../../utils/myPageStore');
        const liked = getLikedPosts().some(l => Number(l.id) === qid && l.type === 'study');
        const existing = posts.find((p: any) => p.id === qid);
        if (existing) {
          if (existing.isLiked !== Boolean(liked)) {
            const updated = posts.map((p: any) => p.id === qid ? { ...p, isLiked: Boolean(liked) } : p);
            dispatch(setPosts(updated));
          }
        }
      } catch (e) { console.error('likedUpdated handler failed', e); }
    };

    window.addEventListener('myPage:savedUpdated', savedHandler as EventListener);
    window.addEventListener('myPage:likedUpdated', likedHandler as EventListener);
    return () => {
      window.removeEventListener('myPage:savedUpdated', savedHandler as EventListener);
      window.removeEventListener('myPage:likedUpdated', likedHandler as EventListener);
    };
  }, [id, posts, dispatch]);

  useEffect(() => {
    const qid = Number(id);
    if (!qid) return;

    if (!post || !post.content) {
      const sessionKey = `study_viewed_once_${qid}`;
      let localViews = 0;
      try {
        try {
          const w = window as any;
          if (!w.__studyViewedSet) w.__studyViewedSet = new Set<number>();
          if (w.__studyViewedSet.has(qid)) {
            const stored = localStorage.getItem(`study_views_${qid}`);
            localViews = stored ? Number(stored) : 0;
          } else {
            w.__studyViewedSet.add(qid);
            const already = sessionStorage.getItem(sessionKey);
            if (!already) {
              try { sessionStorage.setItem(sessionKey, '1'); } catch (e) {}
              console.debug('[StudyDetail] incrementing view for', qid);
              localViews = incrementViewCount(qid);
            } else {
              const stored = localStorage.getItem(`study_views_${qid}`);
              localViews = stored ? Number(stored) : 0;
            }
          }
        } catch (e) {
          const already = sessionStorage.getItem(sessionKey);
          if (!already) {
            try { sessionStorage.setItem(sessionKey, '1'); } catch (e) {}
            localViews = incrementViewCount(qid);
          } else {
            const stored = localStorage.getItem(`study_views_${qid}`);
            localViews = stored ? Number(stored) : 0;
          }
        }
      } catch (e) {
        localViews = incrementViewCount(qid);
      }

      const fetchDetail = async () => {
        try {
          const w = window as any;
          if (!w.__studyDetailFetching) w.__studyDetailFetching = new Set<number>();
          if (w.__studyDetailFetching.has(qid)) {
            console.debug('[StudyDetail] fetch already in progress for', qid);
            return;
          }
          w.__studyDetailFetching.add(qid);
        } catch (e) {}

        try {
          setLoadingDetail(true);
          const res = await interviewService.getQuestionDetail(qid);
          const data: any = res;
          const scrapFlag = data?.scrapExists ?? data?.isScraped ?? data?.scrapped ?? false;
          setIsScrapped(Boolean(scrapFlag));
          
          console.log("API Response Data:", data); 

          const updatedPosts = [...posts];
          const idx = updatedPosts.findIndex(p => p.id === qid);
          
          const content = data.content || '';
          const modelAnswer = data.modelAnswer || '';
          
          const fetchedTitle = data.title || data.content; 
          
          const title = fetchedTitle || (post ? post.title : (locationState?.title || 'Untitled'));
          const category = post?.category || locationState?.category || 'CS';

          const finalViews = (data.views !== undefined && data.views !== null) 
                             ? data.views 
                             : localViews;

          try { console.debug('[StudyDetail] final views for', qid, '=>', finalViews); } catch (e) {}

          const newPost: StudyPost = {
            id: qid,
            title,
            category,
            author: post?.author || 'DADAP_Archive',
            date: post?.date || new Date().toISOString().split('T')[0],
            views: finalViews, 
            comments: post?.comments || 0,
            likes: post?.likes || 0,
            isLiked: post?.isLiked || false,
            content,
            modelAnswer,
            followUpQuestions: data.followUpQuestions || [],
          };

          try {
            const { getSavedProblems, getLikedPosts } = await import('../../../utils/myPageStore');
            try {
              const saved = getSavedProblems().some(s => Number(s.id) === qid);
              if (saved) setIsScrapped(true);
            } catch (e) { console.error('apply local saved check failed', e); }

            try {
              const liked = getLikedPosts().some(l => Number(l.id) === qid && l.type === 'study');
              if (liked && !newPost.isLiked) {
                newPost.isLiked = true;
                newPost.likes = (newPost.likes || 0) + 1;
              }
            } catch (e) { console.error('apply local liked check failed', e); }
          } catch (e) {
            console.error('failed to apply local mypage overrides', e);
          }

          if (idx >= 0) {
            updatedPosts[idx] = newPost;
          } else {
            updatedPosts.push(newPost);
          }

          dispatch(setPosts(updatedPosts));
        } catch (e: any) {
           console.error("Failed to fetch detail", e);
        } finally {
          try {
            const w = window as any;
            if (w.__studyDetailFetching) w.__studyDetailFetching.delete(qid);
          } catch (e) {}
          setLoadingDetail(false);
        }
      };

      fetchDetail();
    }
  }, [id, post, posts, dispatch, locationState]); 

  React.useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch (e) {
      try { window.scrollTo(0, 0); } catch (err) {}
    }
  }, [id]);

  React.useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch (e) {
      try { window.scrollTo(0, 0); } catch (err) {}
    }
  }, [id]);

  const handleToggleScrap = async () => {
    if (!post) return;
    setScrapLoading(true);
    try {
      const qid = post.id;
      if (!isScrapped) {
        await interviewService.addQuestionScrap(qid);
        setIsScrapped(true);
        try {
          const { refreshSavedProblems } = await import('../../../utils/myPageStore');
          if (typeof refreshSavedProblems === 'function') await refreshSavedProblems(0, 20);
        } catch (e) { console.error('refresh saved problems failed', e); }
      } else {
        await interviewService.removeQuestionScrap(qid);
        setIsScrapped(false);
        try {
          const { refreshSavedProblems } = await import('../../../utils/myPageStore');
          if (typeof refreshSavedProblems === 'function') await refreshSavedProblems(0, 20);
        } catch (e) { console.error('refresh saved problems failed', e); }
      }
    } catch (e) {
      console.error('Failed to toggle scrap', e);
    } finally {
      setScrapLoading(false);
    }
  };

  return {
    id,
    navigate,
    locationState,
    dispatch,
    loadingDetail,
    scrapLoading,
    isScrapped,
    showFollowUps,
    setShowFollowUps,
    post,
    handleBackToList,
    handleToggleLike,
    handleToggleScrap,
  };
};