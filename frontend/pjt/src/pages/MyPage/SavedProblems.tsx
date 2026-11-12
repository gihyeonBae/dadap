import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import MyPageHeader from '../../components/MyPage/MyPageHeader';
import SavedProblemItem from '../../components/MyPage/SavedProblemItem';
import type { SavedProblem } from '../../components/MyPage/SavedProblemItem';
import { getSavedBoards, removeSavedBoard, removeLikedPost } from '../../utils/myPageStore';
import type { SavedBoard } from '../../utils/myPageStore';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Bookmark } from 'lucide-react';
import { interviewService } from '../../api/interviewService';

const PAGE_SIZE = 7;

const SavedProblems: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [savedItems, setSavedItems] = useState<SavedProblem[]>([]);
  const [likedBoards, setLikedBoards] = useState<SavedBoard[]>(() => getSavedBoards());
  const [category, setCategory] = useState<'ALL' | 'STUDY' | 'COMMUNITY'>('ALL');
  const [totalPagesState, setTotalPagesState] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const likedHandler = () => {
      const boards = getSavedBoards();
      setLikedBoards(boards);
    };

    window.addEventListener('myPage:likedUpdated', likedHandler as EventListener);
    return () => {
      window.removeEventListener('myPage:likedUpdated', likedHandler as EventListener);
    };
  }, []);

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        // Migrate legacy saved problems from localStorage (if any) to backend scrap API.
        try {
          const legacyPrefix = 'dadap_saved_problems_v1';
          const keys = Object.keys(localStorage).filter(k => k.startsWith(legacyPrefix));
          if (keys.length > 0) {
            console.debug('[SavedProblems] migrating legacy saved problems', keys);
            for (const k of keys) {
              try {
                const raw = localStorage.getItem(k);
                if (!raw) continue;
                const arr = JSON.parse(raw);
                for (const item of arr) {
                  const qid = Number(item?.id ?? item?.questionId ?? item);
                  if (!Number.isNaN(qid)) {
                    try { await interviewService.addQuestionScrap(qid); } catch (e) { console.debug('[SavedProblems] migration add failed', qid, e); }
                  }
                }
                try { localStorage.removeItem(k); } catch (e) { console.debug('[SavedProblems] remove legacy key failed', k, e); }
              } catch (e) { console.debug('[SavedProblems] parse legacy key failed', k, e); }
            }
          }
        } catch (e) { console.debug('[SavedProblems] legacy migration check failed', e); }

        const res = await interviewService.getScrappedQuestions({ page: Math.max(0, page - 1), size: PAGE_SIZE });
        const body = (res as any).data ?? res;
        console.debug('[SavedProblems] scrapped list body:', body);
        let items: any[] = [];
        if (Array.isArray(body)) items = body;
        else if (Array.isArray(body?.data)) items = body.data;
        else if (Array.isArray(body?.items)) items = body.items;
        else if (Array.isArray(body?.data?.items)) items = body.data.items;
        else items = body?.items ?? body?.data ?? [];
        if (canceled) return;
        const mapped: SavedProblem[] = (items || []).map((it: any) => ({
          id: it.questionId,
          category: it.categoryName ?? String(it.categoryId ?? ''),
          subCategory: '',
          title: it.title,
          difficulty: (it.difficulty === 1 ? '쉬움' : it.difficulty === 2 ? '보통' : '어려움'),
          savedDate: '',
          tags: [],
        }));
        setSavedItems(mapped);
        const total = Number(body?.totalElements ?? body?.data?.totalElements ?? mapped.length) || mapped.length;
        const pages = Number(body?.totalPages ?? body?.data?.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE))) || Math.max(1, Math.ceil(total / PAGE_SIZE));
        setTotalElements(total);
        setTotalPagesState(pages);
      } catch (e) {
        console.error('Failed to fetch scrapped questions', e);
      }
    })();
    return () => { canceled = true; };
  }, [page]);

  // When category is COMMUNITY show saved boards (from in-memory store)
  // Otherwise (ALL or STUDY) show server-paginated problems only.
  const problems = savedItems;
  const boards = likedBoards;

  const totalCount = category === 'COMMUNITY' ? boards.length : totalElements;
  const totalPages = category === 'COMMUNITY'
    ? Math.max(1, Math.ceil(boards.length / PAGE_SIZE))
    : totalPagesState;

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paged = useMemo(() => {
    if (category === 'COMMUNITY') {
      const start = (page - 1) * PAGE_SIZE;
      return boards.slice(start, start + PAGE_SIZE).map(b => ({ kind: 'board' as const, data: b }));
    }
    // For STUDY/ALL we rely on server-provided `savedItems` which already represents the current page
    return problems.map(p => ({ kind: 'problem' as const, data: p }));
  }, [problems, boards, page, category]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <MyPageHeader
        title="저장한 문제"
        showDot={false}
      />

      {/* Category tabs - match LikedPosts style */}
      <div className="flex gap-3 mb-6">
        {(['ALL','STUDY','COMMUNITY'] as const).map((c) => (
          <button
            key={c}
            onClick={() => { setCategory(c as any); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${category === c ? 'bg-indigo-500 text-white shadow-[0_6px_20px_rgba(99,102,241,0.3)]' : 'bg-white/5 text-zinc-300 hover:bg-white/10'}`}
          >
            {c === 'ALL' ? '전체' : c === 'STUDY' ? '학습' : '커뮤니티'}
          </button>
        ))}
      </div>

      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } }
        }}
        className="p-12 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl"
      >
        <div className="grid grid-cols-1 gap-6">
          {totalCount === 0 ? (
            <p className="text-zinc-400 text-center py-12">저장된 항목이 없습니다.</p>
          ) : (
            paged.map((entry, idx) => (
              entry.kind === 'problem' ? (
                <SavedProblemItem
                  key={`p-${entry.data.id}`}
                  problem={entry.data}
                  onSolve={(id) => navigate(`/study/post/${id}`)}
                  onDelete={async (id, e) => {
                    e.stopPropagation();
                    try {
                      await interviewService.removeQuestionScrap(id);
                      // re-fetch current page from backend so UI reflects DB
                      try {
                        const res = await interviewService.getScrappedQuestions({ page: Math.max(0, page - 1), size: PAGE_SIZE });
                        const body = (res as any).data ?? res;
                        let items: any[] = [];
                        if (Array.isArray(body)) items = body;
                        else if (Array.isArray(body?.data)) items = body.data;
                        else if (Array.isArray(body?.items)) items = body.items;
                        else if (Array.isArray(body?.data?.items)) items = body.data.items;
                        else items = body?.items ?? body?.data ?? [];
                        const mapped: SavedProblem[] = (items || []).map((it: any) => ({
                          id: it.questionId,
                          category: it.categoryName ?? String(it.categoryId ?? ''),
                          subCategory: '',
                          title: it.title,
                          difficulty: (it.difficulty === 1 ? '쉬움' : it.difficulty === 2 ? '보통' : '어려움'),
                          savedDate: '',
                          tags: [],
                        }));
                        setSavedItems(mapped);
                        const total = Number(body?.totalElements ?? body?.data?.totalElements ?? mapped.length) || mapped.length;
                        const pages = Number(body?.totalPages ?? body?.data?.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE))) || Math.max(1, Math.ceil(total / PAGE_SIZE));
                        setTotalElements(total);
                        setTotalPagesState(pages);
                      } catch (e) {
                        // If refetch fails, fall back to local filter update
                        console.debug('[SavedProblems] refetch after delete failed', e);
                        setSavedItems(prev => prev.filter(p => p.id !== id));
                        setTotalElements(t => Math.max(0, t - 1));
                      }
                    } catch (err) {
                      console.error('Failed to remove scrap', err);
                    }
                  }}
                />
              ) : (
                // simple board card
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} key={`b-${entry.data.id}`} className="group relative">
                  <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] flex justify-between items-center">
                    <div className="flex-1 pr-6">
                      <h3 className="text-lg md:text-xl font-bold text-white line-clamp-2">{entry.data.title}</h3>
                      <div className="text-sm text-zinc-500 mt-2">{entry.data.author ?? 'community'} • {entry.data.date}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); removeSavedBoard(entry.data.id); }}
                        title="삭제"
                        className="w-9 h-9 rounded-md flex items-center justify-center border border-white/10 bg-white/5 text-zinc-300 hover:bg-rose-600/10 hover:text-rose-400 hover:border-rose-400 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m5 0V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"/></svg>
                      </button>

                      <button onClick={() => navigate(`/community/${entry.data.id}`, { state: { from: '/mypage/saved' } })} className="px-3 py-2 rounded bg-zinc-700 hover:bg-zinc-600 text-white">보기</button>
                    </div>
                  </div>
                </motion.div>
              )
            ))
          )}
        </div>

        {/* Pagination controls */}
        {totalCount > PAGE_SIZE && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className={`w-10 h-10 rounded-md flex items-center justify-center border border-white/10 ${page === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5'}`}
              aria-label="first"
            >
              <ChevronsLeft size={16} />
            </button>

            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`w-10 h-10 rounded-md flex items-center justify-center border border-white/10 ${page === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5'}`}
              aria-label="prev"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const n = idx + 1;
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  aria-current={page === n ? 'page' : undefined}
                  className={`w-10 h-10 rounded-md flex items-center justify-center border ${page === n ? 'bg-zinc-700 text-white border-zinc-700' : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'}`}
                >{n}</button>
              );
            })}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`w-10 h-10 rounded-md flex items-center justify-center border border-white/10 ${page === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5'}`}
              aria-label="next"
            >
              <ChevronRight size={16} />
            </button>

            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className={`w-10 h-10 rounded-md flex items-center justify-center border border-white/10 ${page === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5'}`}
              aria-label="last"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SavedProblems;