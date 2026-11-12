import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MyPageHeader from '../../components/MyPage/MyPageHeader';
import { getLikedPosts, removeLikedPost } from '../../utils/myPageStore';
import { Heart, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllPosts, setPosts } from '../../redux/slices/studySlice';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const PAGE_SIZE = 7;

const LikedPosts: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const posts = useSelector(selectAllPosts);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState(() => getLikedPosts());
  const [category, setCategory] = useState<'ALL' | 'STUDY' | 'COMMUNITY'>('ALL');
  useEffect(() => {
    const handler = () => setItems(getLikedPosts());
    window.addEventListener('myPage:likedUpdated', handler as EventListener);
    return () => window.removeEventListener('myPage:likedUpdated', handler as EventListener);
  }, []);
  const filteredItems = useMemo(() => {
    return items.filter(p => {
      if (category === 'ALL') return p.type === 'board' || p.type === 'study';
      if (category === 'COMMUNITY') return p.type === 'board';
      return p.type === 'study';
    });
  }, [items, category]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page]);

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
        title="Liked Posts"
        showDot={false}
      />

      {/* Category tabs */}
      <div className="flex gap-3 mb-6">
        {(['ALL','STUDY','COMMUNITY'] as const).map((c) => (
          <button
            key={c}
            onClick={() => { setCategory(c as any); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${category === c ? 'bg-indigo-500 text-white shadow-[0_6px_20px_rgba(99,102,241,0.3)]' : 'bg-white/5 text-zinc-300 hover:bg-white/10'}`}
          >
            {c === 'ALL' ? 'ALL' : c === 'STUDY' ? 'STUDY' : 'COMMUNITY'}
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
          {items.filter(p => (category === 'ALL' ? true : category === 'COMMUNITY' ? p.type === 'board' : p.type === 'study')).length === 0 ? (
            <p className="text-zinc-400 text-center py-12">좋아요한 글이 없습니다.</p>
            ) : (
            paged.map((item) => (
              <div key={`${item.type}-${item.id}`} className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] flex justify-between items-center">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white line-clamp-2">{item.title}</h3>
                  <div className="text-sm text-zinc-500 mt-2">{item.author} • {item.date}</div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          // remove liked post locally and update Redux posts if present
                          try {
                            removeLikedPost(item.id, item.type as any);
                            setItems(getLikedPosts());
                            // update redux posts state if this is a study post
                            if (item.type === 'study' && posts && posts.length) {
                              const updated = posts.map(p => p.id === item.id ? { ...p, isLiked: false, likes: Math.max(0, (p.likes || 0) - 1) } : p);
                              dispatch(setPosts(updated));
                            }
                          } catch (e) {
                            console.error('failed to remove liked post', e);
                          }
                        }}
                        title="Remove"
                        className="w-9 h-9 rounded-md flex items-center justify-center border border-white/10 bg-white/5 text-zinc-300 hover:bg-rose-600/10 hover:text-rose-400 hover:border-rose-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button onClick={() => {
                        if (item.type === 'study') navigate(`/study/post/${item.id}`);
                        else {
                          // Navigate directly to community detail and pass origin so "back" returns to Likes
                          navigate(`/community/${item.id}`, { state: { from: '/mypage/likes' } });
                        }
                      }} className="px-3 py-2 rounded bg-zinc-700 hover:bg-zinc-600 text-white shadow-md">View</button>
                    </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination controls */}
        {items.length > PAGE_SIZE && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className={`w-10 h-10 rounded-md flex items-center justify-center border border-white/10 ${page === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5'}`}
              aria-label="first"
            >
              <ChevronsLeft size={18} />
            </button>

            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`w-10 h-10 rounded-md flex items-center justify-center border border-white/10 ${page === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5'}`}
              aria-label="prev"
            >
              <ChevronLeft size={18} />
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
              <ChevronRight size={18} />
            </button>

            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className={`w-10 h-10 rounded-md flex items-center justify-center border border-white/10 ${page === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5'}`}
              aria-label="last"
            >
              <ChevronsRight size={18} />
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default LikedPosts;
