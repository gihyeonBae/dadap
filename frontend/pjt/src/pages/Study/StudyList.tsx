// filepath: src/pages/Study/StudyList.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { motion } from 'framer-motion';
import PostItem from './PostItem';
import CategoryBar from './CategoryBar'; 

import { useSelector, useDispatch } from 'react-redux';
import { 
  selectFilteredPosts, 
  selectCurrentCategory, 
  type StudyPost,
  setPosts,
  setCategory,
} from '../../redux/slices/studySlice';
import { mockPosts } from './studyMock';
import { interviewService } from '../../api/interviewService';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } }
};

const StudyList: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  
  // URL 쿼리 파라미터(?page=...) 처리를 위한 Hook
  const location = useLocation();
  const navigate = useNavigate();

  const filteredPosts = useSelector(selectFilteredPosts);
  const currentCategory = useSelector(selectCurrentCategory);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  // [중요] 초기 로드 시 URL에 있는 page 값을 state로 가져옵니다.
  const [page, setPage] = useState(() => {
    const searchParams = new URLSearchParams(location.search);
    const pageParam = searchParams.get('page');
    // pageParam이 있으면 숫자로 변환, 없으면 0 (첫 페이지)
    return pageParam ? Number(pageParam) : 0;
  });

  // 1. URL 파라미터가 변경되면 Redux currentCategory 동기화
  useEffect(() => {
    if (category) {
      let cat = category.toUpperCase();
      // URL -> 내부 카테고리명 매핑
      if (cat === 'NETWORK') cat = 'NETWORK';
      else if (cat === 'FE') cat = 'FE';
      else if (cat === 'BE') cat = 'BE';
      else if (cat === 'OS') cat = 'OS';
      else if (cat === 'DSA') cat = 'DSA';
      else if (cat === 'DB') cat = 'DB';
      else if (cat === 'ALL') cat = 'ALL';
      dispatch(setCategory(cat));
    } else {
      dispatch(setCategory('ALL'));
    }
  }, [category, dispatch]);

  // 2. page 상태가 변경될 때마다 URL 쿼리 스트링 업데이트
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('page', page.toString());
    
    // 페이지 이동 없이 URL만 업데이트 (replace: true로 뒤로가기 히스토리 꼬임 방지)
    navigate({ search: searchParams.toString() }, { replace: true });
  }, [page, navigate]);

  // 제목 기반 카테고리 추론 함수
  const inferCategory = (title: string, defaultCat: string): string => {
    const t = title.toUpperCase();
    if (t.includes('DB') || t.includes('SQL') || t.includes('트랜잭션') || t.includes('TRANSACTION') || t.includes('INDEX') || t.includes('정규화')) return 'DB';
    if (t.includes('TCP') || t.includes('IP') || t.includes('HTTP') || t.includes('OSI') || t.includes('LAN') || t.includes('소켓') || t.includes('네트워크')) return 'NETWORK';
    if (t.includes('REACT') || t.includes('VUE') || t.includes('CSS') || t.includes('DOM') || t.includes('브라우저') || t.includes('JAVASCRIPT') || t.includes('TYPESCRIPT') || t.includes('FE')) return 'FE';
    if (t.includes('SPRING') || t.includes('JAVA') || t.includes('JVM') || t.includes('GC') || t.includes('API') || t.includes('REST') || t.includes('BE')) return 'BE';
    if (t.includes('운영체제') || t.includes('OS') || t.includes('프로세스') || t.includes('스레드') || t.includes('메모리') || t.includes('스케줄링') || t.includes('CS')) return 'CS';
    if (t.includes('알고리즘') || t.includes('자료구조') || t.includes('STACK') || t.includes('QUEUE') || t.includes('TREE') || t.includes('GRAPH') || t.includes('정렬')) return 'DATA STR';
    
    return defaultCat === 'ALL' ? 'CS' : defaultCat; 
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const rawCat = category ? category.toUpperCase() : 'ALL';
        let catKey = rawCat;
        // 카테고리명 <-> ID 매핑 (백엔드 순서: OS-1, NETWORK-2, DSA-3, DB-4, FE-5, BE-6)
        const categoryMap: Record<string, number> = {
          OS: 1, NETWORK: 2, DSA: 3, DB: 4, FE: 5, BE: 6
        };
        const categoryIdToName: Record<number, string> = {
          1: 'OS', 2: 'NETWORK', 3: 'DSA', 4: 'DB', 5: 'FE', 6: 'BE'
        };

        const categoryId = categoryMap[catKey];
        const params: { categoryId?: number; page?: number; size?: number } = { page, size: 10 };
        if (categoryId) params.categoryId = categoryId;

        const res = await interviewService.getQuestions(params);
        console.log('getQuestions response:', res);

        const items = (res as any).items || [];
        setTotalPages((res as any).totalPages ?? 1);
        // 카테고리 우선순위: OS(1), NETWORK(2), DSA(3), DB(4), FE(5), BE(6)
        const categoryOrder = { OS: 1, NETWORK: 2, DSA: 3, DB: 4, FE: 5, BE: 6 };
        let mapped: StudyPost[] = items.map((it: any) => {
          let finalCategory = it.categoryId ? categoryIdToName[it.categoryId] : undefined;
          let catId = it.categoryId;
          if (!finalCategory && catKey === 'ALL') {
            finalCategory = inferCategory(it.title, 'NETWORK');
          }
          return {
            id: it.questionId,
            title: it.title,
            category: finalCategory || '',
            author: 'DADAP_Archive',
            date: '',
            views: (it.views !== undefined && it.views !== null) ? it.views : 0,
            comments: it.comments ?? 0,
            likes: it.likes ?? 0,
            isLiked: it.liked ?? false,
            content: '',
            _catId: catId // 내부 정렬용
          };
        });
        // 카테고리 우선순위로 정렬
        mapped = mapped.sort((a, b) => {
          const aOrder = categoryOrder[a.category] || 99;
          const bOrder = categoryOrder[b.category] || 99;
          if (aOrder !== bOrder) return aOrder - bOrder;
          return Number(a.id) - Number(b.id);
        });
        // _catId 제거
        mapped = mapped.map(({ _catId, ...rest }) => rest);
        console.log('mapped study posts:', mapped);
        dispatch(setPosts(mapped));
      } catch (e) {
        console.error('Failed to load study posts, using mock data', e);
        dispatch(setPosts(mockPosts()));
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [dispatch, category, page]); 

  // 3. 카테고리 변경 시 페이지 리셋 로직
  useEffect(() => {
    // 카테고리 변경 시 페이지 리셋
    const key = currentCategory?.toUpperCase?.() || 'ALL';
    // URL에 'page' 파라미터가 "없을 때만" 0페이지로 리셋합니다.
    const searchParams = new URLSearchParams(location.search);
    if (!searchParams.has('page')) {
      setPage(0);
    }
  }, [currentCategory, location.search]);

  return (
    <div className="relative min-h-screen w-full bg-bg-main pb-20 font-sans text-text-main overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-bg-main bg-[radial-gradient(var(--bg-surface)_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,var(--accent-secondary),transparent)]"></div>
        </div>

      <div className="relative z-10 max-w-5xl mx-auto pt-32 px-6">
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="mb-12 text-center"
        >
          <h3 className="text-text-main">
            {currentCategory === 'ALL' ? 'CS STUDY' : currentCategory}
          </h3>
          <p className="text-text-sub font-medium text-lg">
            Knowledge Archive & Community
          </p>
        </motion.div>

        <div className="mb-12">
            <CategoryBar />
        </div>

        <main className="border-t border-border-main">
          {loading ? (
            <div className="text-center py-20">
              <p className="text-text-muted">로딩 중...</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post: StudyPost) => (
              <PostItem
                key={post.id}
                id={post.id}
                title={post.title}
                author={post.author}
                date={post.date}
                category={post.category}
                comments={post.comments}
                views={post.views}
                likes={post.likes}
                isLiked={post.isLiked}
                
                // [수정] 
                // 1. 현재 페이지 정보를 넘겨줍니다.
                currentPage={page} 
                
                // 2. ★ [추가됨] 현재 보고 있는 리스트의 카테고리(URL slug)를 넘겨줍니다.
                // 이 값이 있어야 상세 페이지에서 '뒤로가기' 할 때 원래 있던 탭(ALL 등)으로 돌아옵니다.
                returnCategory={category || 'all'}
              />
            ))
          ) : (
            <div className="text-center py-20">
              <p className="text-text-muted">해당 카테고리에 게시물이 없습니다.</p>
            </div>
          )}
        </main>

        <footer className="flex justify-center items-center gap-3 mt-16 pb-16">
          <button
            onClick={() => setPage(0)}
            className="flex items-center justify-center w-10 h-10 rounded-lg border bg-bg-card border-border-main text-text-sub transition-all hover:text-text-main hover:border-accent-primary/30"
            disabled={page <= 0}
            title="First Page"
          >
            <ChevronsLeft size={18} />
          </button>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="flex items-center justify-center w-10 h-10 rounded-lg border bg-bg-card border-border-main text-text-sub transition-all hover:text-text-main hover:border-accent-primary/30"
            disabled={page <= 0}
          >
            <ChevronLeft size={18} />
          </button>
          {(() => {
            const pageSize = 10;
            const startPage = Math.floor(page / pageSize) * pageSize;
            const endPage = Math.min(totalPages, startPage + pageSize);

            return Array.from({ length: endPage - startPage }).map((_, idx) => {
              const p = startPage + idx;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg font-bold text-sm transition-colors ${
                    p === page
                      ? 'bg-accent-primary border border-accent-primary text-white shadow-lg shadow-accent-primary/20'
                      : 'bg-bg-card border border-border-main text-text-sub hover:text-text-main hover:border-accent-primary/30'
                  }`}
                >
                  {p + 1}
                </button>
              );
            });
          })()}
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="flex items-center justify-center w-10 h-10 rounded-lg border bg-bg-card border-border-main text-text-sub transition-all hover:text-text-main hover:border-accent-primary/30"
            disabled={page >= totalPages - 1}
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => setPage(totalPages - 1)}
            className="flex items-center justify-center w-10 h-10 rounded-lg border bg-bg-card border-border-main text-text-sub transition-all hover:text-text-main hover:border-accent-primary/30"
            disabled={page >= totalPages - 1}
            title="Last Page"
          >
            <ChevronsRight size={18} />
          </button>
        </footer>
      </div>
    </div>
  );
};

export default StudyList;