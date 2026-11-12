import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  MessageCircle, Heart, ArrowLeft, ChevronLeft, ChevronRight, Eye, EyeOff, Trash2, Edit3, CornerDownRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
// ...existing code...

// ==========================================
// Removed dummy data, CommunityPost type, and related logic
// Keeping only the boardsService based list retrieval logic

// ==========================================
// 2. 내부 컴포넌트
// ==========================================



import { boardsService } from '../../api/myBoardsService';
import type { BoardListItem, BoardPost, BoardComment } from '../../api/myBoardsService';

// NOTE: we use a global pending map below to dedupe in-flight requests
const CommunityItem: React.FC<{ post: BoardListItem; onToggleLike?: (postId: number, data: { likes: number; liked: boolean; views?: number }) => void }> = ({ post, onToggleLike }) => {
  const navigate = useNavigate();
  // 필드 기본값 처리
  const title = post.title || '(제목 없음)';
  const authorName = post.authorName || '알 수 없음';
  const createdAt = post.createdAt ? String(post.createdAt).slice(0, 10) : '';
  const views = typeof post.views === 'number' ? post.views : 0;
  const likes = typeof post.likes === 'number' ? post.likes : 0;
  return (
    <div 
      onClick={() => navigate(`/community/${post.postId}`)}
      className="group relative block bg-transparent border-b border-zinc-800/50 p-6 transition-all duration-300 hover:bg-white/[0.02] cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {post.category && (
              <span className="inline-block text-xs px-3 py-1 rounded-full bg-zinc-900/60 text-blue-400 border border-zinc-800">{post.category}</span>
            )}
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-blue-400 group-hover:text-blue-300 transition-colors mb-2">
            {title}
          </h3>
        </div>
          <div className="flex items-center gap-6 text-zinc-500 text-sm font-medium mt-2 sm:mt-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden">
              <img
                src={post.authorProfileImageUrl || "/images/cat_logo.png"}
                alt="user"
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/cat_logo.png'; }}
              />
            </div>
            <span className="text-zinc-400">{authorName}</span>
          </div>
          <span className="text-zinc-600 hidden sm:block">{createdAt}</span>
          <span className="text-zinc-600 hidden sm:flex items-center gap-2">
            <Eye size={14} /> <span className="text-zinc-400">조회수 {views}</span>
          </span>
          <div
            className={`flex items-center gap-2 transition-colors ${post.liked ? 'text-rose-400' : 'hover:text-rose-400'}`}
            onClick={async (e) => {
              e.stopPropagation();
              try {
                const res = await boardsService.likeBoard(post.postId);
                onToggleLike && onToggleLike(post.postId, { likes: res.likes, liked: res.liked, views: res.views });
                try {
                  const { addLikedPost, removeLikedPost } = await import('../../utils/myPageStore');
                  const likedPost = {
                    id: post.postId,
                    type: 'board' as const,
                    title: post.title,
                    author: post.authorName,
                    date: post.createdAt?.slice(0,10),
                    likes: res.likes,
                  };
                  if (res.liked) addLikedPost(likedPost);
                  else removeLikedPost(post.postId, 'board');
                } catch (e) { console.error('persist liked post failed', e); }
              } catch (err) {
                console.error('[CommunityItem] like failed', err);
              }
            }}
          >
            <Heart size={14} />
            <span className="font-semibold">{likes}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. 메인 페이지 컴포넌트
// ==========================================

export const CommunityList: React.FC = () => {
  const [posts, setPosts] = useState<BoardListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<'latest' | 'likes' | 'views'>('latest');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  React.useEffect(() => {
    setLoading(true);
    boardsService.getBoards({ sort, page, size })
      .then((data) => {
        console.log('[boardsService.getBoards] ??:', data);
        setPosts(data.posts || []);
        setTotalPages(typeof data.totalPages === 'number' ? data.totalPages : 1);
      })
      .catch((err) => {
        setError('???? ???? ?????.');
        console.error('[boardsService.getBoards] ??:', err);
      })
      .finally(() => setLoading(false));
  }, [sort, page, size]);

  return (
    <div className="relative min-h-screen w-full bg-[#050505] pb-20 font-sans text-white overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#050505] bg-[radial-gradient(#1E1E1E_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#312e81,transparent)]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto pt-48 px-6">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter italic uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] mb-4">
            COMMUNITY
          </h1>
          <p className="text-zinc-400 font-bold tracking-[0.2em] uppercase text-sm">
            Developers Knowledge Archive
          </p>
        </div>

        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Sort</label>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value as 'latest' | 'likes' | 'views'); setPage(0); }}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border border-white/15 bg-gradient-to-b from-zinc-900/80 to-zinc-900/40 text-white/90 shadow-[0_8px_20px_rgba(0,0,0,0.35),inset_0_0_0_1px_rgba(255,255,255,0.03)] hover:border-white/30 focus:outline-none focus:border-white/50 focus:shadow-[0_0_0_2px_rgba(59,130,246,0.35)]"
            >
              <option value="latest" className="bg-zinc-900 text-white">Latest</option>
              <option value="likes" className="bg-zinc-900 text-white">Likes</option>
              <option value="views" className="bg-zinc-900 text-white">Views</option>
            </select>
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-2">Size</label>
            <select
              value={size}
              onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border border-white/15 bg-gradient-to-b from-zinc-900/80 to-zinc-900/40 text-white/90 shadow-[0_8px_20px_rgba(0,0,0,0.35),inset_0_0_0_1px_rgba(255,255,255,0.03)] hover:border-white/30 focus:outline-none focus:border-white/50 focus:shadow-[0_0_0_2px_rgba(59,130,246,0.35)]"
            >
              <option value={10} className="bg-zinc-900 text-white">10</option>
              <option value={20} className="bg-zinc-900 text-white">20</option>
              <option value={30} className="bg-zinc-900 text-white">30</option>
            </select>
          </div>
          <button
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow transition-colors"
            onClick={() => navigate('/community/create')}
          >
            {'\uAE00\uC4F0\uAE30'}
          </button>
        </div>

        <main className="border-t border-zinc-800/50">
          {loading ? (
            <div className="text-center py-20 border-b border-zinc-800/50">
              <p className="text-zinc-500">?? ?..</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 border-b border-zinc-800/50">
              <p className="text-zinc-500">{error}</p>
            </div>
          ) : Array.isArray(posts) && posts.length > 0 ? (
            posts.map((post, idx) => (
              <CommunityItem
                key={post?.postId ?? idx}
                post={post}
                onToggleLike={(postId, data) => {
                  setPosts(prev => prev.map(p => p.postId === postId ? { ...p, likes: data.likes, liked: data.liked, views: data.views ?? p.views } : p));
                }}
              />
            ))
          ) : (
            <div className="text-center py-20 border-b border-zinc-800/50">
              <p className="text-zinc-500">???? ????.</p>
            </div>
          )}
        </main>

        {totalPages > 1 && (
          <footer className="flex justify-center items-center gap-2 mt-16 pb-16">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/[0.02] border border-white/10 text-zinc-600 hover:text-white transition-all disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page <= 0}
            >
              <ChevronLeft size={18} />
            </button>
            {(() => {
              const windowSize = 8;
              const start = Math.max(0, Math.min(page - 2, totalPages - windowSize));
              const end = Math.min(totalPages, start + windowSize);
              const pages = Array.from({ length: end - start }, (_, i) => start + i);
              const showLeftEllipsis = start > 0;
              const showRightEllipsis = end < totalPages;
              return (
                <>
                  {showLeftEllipsis && (
                    <>
                      <button
                        onClick={() => setPage(0)}
                        className="w-10 h-10 rounded-lg font-bold text-sm transition-colors bg-white/[0.02] border border-white/10 text-zinc-600 hover:text-white"
                      >
                        1
                      </button>
                      <span className="text-zinc-600 px-2">...</span>
                    </>
                  )}
                  {pages.map((idx) => (
                    <button
                      key={idx}
                      onClick={() => setPage(idx)}
                      className={`w-10 h-10 rounded-lg font-bold text-sm transition-colors ${
                        idx === page ? 'bg-blue-600 text-white border border-blue-500' : 'bg-white/[0.02] border border-white/10 text-zinc-600 hover:text-white'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  {showRightEllipsis && (
                    <>
                      <span className="text-zinc-600 px-2">...</span>
                      <button
                        onClick={() => setPage(totalPages - 1)}
                        className="w-10 h-10 rounded-lg font-bold text-sm transition-colors bg-white/[0.02] border border-white/10 text-zinc-600 hover:text-white"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </>
              );
            })()}
            <button
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/[0.02] border border-white/10 text-zinc-600 hover:text-white transition-all disabled:opacity-40"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight size={18} />
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};

export const CommunityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = React.useState<BoardPost | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [likeLoading, setLikeLoading] = React.useState(false);
  
  const [commentContent, setCommentContent] = React.useState('');
  const [commentLoading, setCommentLoading] = React.useState(false);
  const [commentError, setCommentError] = React.useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [commentToDelete, setCommentToDelete] = React.useState<number | null>(null);
  const replyRefs = React.useRef<Record<number, HTMLInputElement | null>>({});
  const [openReplyParent, setOpenReplyParent] = React.useState<number | null>(null);
  const [replyLoadingFor, setReplyLoadingFor] = React.useState<number | null>(null);
  const [expandedReplies, setExpandedReplies] = React.useState<number[]>([]);

  // image error / retry handling for external CDN images
  const [imgError, setImgError] = React.useState(false);
  const [imgRetryCount, setImgRetryCount] = React.useState(0);

  // 현재 로그인한 사용자 정보 확인: localStorage의 `userInfo`에서 nickname 사용
  let currentUser = '';
  try {
    const _ui = localStorage.getItem('userInfo');
    const parsed = _ui ? JSON.parse(_ui) : null;
    currentUser = parsed?.nickname || localStorage.getItem('username') || '';
  } catch (e) {
    currentUser = localStorage.getItem('username') || '';
  }
  const isAuthor = post && post.authorName === currentUser;

  React.useEffect(() => {
      if (!id) return;
      // dedupe in-flight requests to avoid duplicate GETs (StrictMode mounts)
      const PENDING: Map<string, Promise<BoardPost>> = (window as any).__DADAP_PENDING_BOARD_REQUESTS ||= new Map();
      const pendingKey = `pending_board_${id}`;
      const existing = PENDING.get(pendingKey);
      if (existing) {
        existing.then((data) => {
          setPost(data);
        }).catch((err) => {
          setError('게시물을 불러오지 못했습니다.');
          console.error('[boardsService.getBoard] 에러 (pending):', err);
        }).finally(() => setLoading(false));
        return;
      }

      const reqPromise = boardsService.getBoard(Number(id))
        .then((data) => {
          setPost(data);
          console.log('[boardsService.getBoard] 응답:', data);
          console.debug('[CommunityDetail] currentUser vs authorName:', currentUser, data.authorName);
          return data;
        })
        .catch((err) => {
          setError('게시물을 불러오지 못했습니다.');
          console.error('[boardsService.getBoard] 에러:', err);
          throw err;
        })
        .finally(() => {
          PENDING.delete(pendingKey);
          setLoading(false);
        });

      PENDING.set(pendingKey, reqPromise);
    
      
    }, [id]);

    // Ensure the page starts at the top when navigating to a community post
    React.useEffect(() => {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      } catch (e) {
        // ignore in non-browser environments
      }
    }, [id]);

  // Listen for myPage storage updates so this detail view updates when likes/saves change elsewhere
  React.useEffect(() => {
    const handlerLiked = async () => {
      const qid = Number(id);
      if (!qid) return;
      try {
        const { getLikedPosts } = await import('../../utils/myPageStore');
        const liked = getLikedPosts().some(l => Number(l.id) === qid && l.type === 'board');
        // Only update the liked boolean here. Numeric likes are updated from server response
        // in handleLike (setPost with res.likes). Avoid double-incrementing by not touching counts.
        setPost(prev => prev ? { ...prev, liked: Boolean(liked) } : prev);
      } catch (e) { console.error('likedUpdated handler failed', e); }
    };

    window.addEventListener('myPage:likedUpdated', handlerLiked as EventListener);
    return () => {
      window.removeEventListener('myPage:likedUpdated', handlerLiked as EventListener);
    };
  }, [id]);

  // 게시글 삭제
  const handleDelete = async () => {
    if (!post) return;
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await boardsService.deleteBoard(post.postId);
      console.log('[boardsService.deleteBoard] 성공:', post.postId, res);
      alert('게시글이 삭제되었습니다.');
      navigate('/community');
    } catch (err) {
      // 상세한 Axios 오류 로깅
      try {
        console.error('[boardsService.deleteBoard] 에러(상세):', err);
        const axiosErr: any = err;
        console.debug('error.response?.status:', axiosErr?.response?.status);
        console.debug('error.response?.data:', axiosErr?.response?.data);
        console.debug('error.request?.responseURL:', axiosErr?.request?.responseURL);
        setDeleteError(axiosErr?.response?.data?.message || '삭제 실패 (서버 에러)');
        alert(`삭제 실패: ${axiosErr?.response?.data?.message || axiosErr?.message}`);
      } catch (e) {
        setDeleteError('삭제 실패');
        console.error('[boardsService.deleteBoard] 에러 처리 중 예외:', e);
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // Recursive comment node component (defined outside JSX)
  const CommentNode: React.FC<{ comment: BoardComment; depth?: number }> = ({ comment, depth = 0 }) => {
    const isReply = (depth || 0) > 0;
    const firstLevel = (depth || 0) === 1;

    // New visual rules:
    // - Top-level comment: card with border
    // - First-level reply: card with bold left accent
    // - Deeper replies: subtle indentation with thin left line (no stacked thick bars)
    const containerCls = !isReply
      ? 'bg-zinc-900 rounded-lg p-4 gap-2 border border-zinc-800 mb-4'
      : firstLevel
        ? 'bg-transparent pl-4 ml-4 py-2 border-l border-white'
        : 'bg-transparent pl-6 ml-6';

    const isExpanded = expandedReplies.includes(comment.commentId);

    return (
      <li key={comment.commentId} className={containerCls}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`${isReply ? 'w-7 h-7' : 'w-9 h-9'} rounded-full bg-zinc-700 overflow-hidden border border-zinc-700`}>
              <img
                src={comment.authorProfileImageUrl || "/images/cat_logo.png"}
                alt={comment.authorName || 'user'}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/cat_logo.png'; }}
              />
            </div>
            <div className="flex flex-col">
              <span className={`font-semibold ${isReply ? 'text-sm text-zinc-200' : 'text-zinc-300'}`}>{comment.authorName}</span>
              <span className="text-xs text-zinc-500">{comment.createdAt?.slice(0, 16).replace('T', ' ')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {comment.replies && comment.replies.length > 0 && (
              <button
                onClick={() => {
                  setExpandedReplies(prev => prev.includes(comment.commentId) ? prev.filter(id => id !== comment.commentId) : [...prev, comment.commentId]);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:text-white"
                aria-label={isExpanded ? `댓글 숨기기 (${comment.replies.length})` : `댓글 보기 (${comment.replies.length})`}
                title={isExpanded ? `댓글 숨기기 (${comment.replies.length})` : `댓글 보기 (${comment.replies.length})`}
              >
                {isExpanded ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            )}
            <button onClick={() => handleReplyToggle(comment.commentId)} className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:text-white" aria-label="답글" title="답글">
              <CornerDownRight size={14} />
            </button>
            {comment.authorName === currentUser && (
              <button
                onClick={() => handleCommentDelete(comment.commentId)}
                disabled={commentToDelete === comment.commentId}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:border-rose-500 hover:text-rose-500 disabled:opacity-50"
                aria-label={commentToDelete === comment.commentId ? '댓글 삭제 중' : '댓글 삭제'}
                title={commentToDelete === comment.commentId ? '삭제중...' : '삭제'}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        <div className={`${isReply ? 'text-zinc-200 text-sm mt-2' : 'mt-2'}`}>{comment.content}</div>

        {openReplyParent === comment.commentId && (
          <form onSubmit={(e) => handleReplySubmit(e, comment.commentId)} className="flex gap-2 mt-3">
            <input
              ref={el => { replyRefs.current[comment.commentId] = el; }}
              defaultValue={''}
              className="flex-1 px-3 py-2 rounded bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-blue-500 text-sm"
              placeholder="대댓글을 입력하세요"
              disabled={replyLoadingFor === comment.commentId}
              required
            />
            <button type="submit" className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50" disabled={replyLoadingFor === comment.commentId}>{replyLoadingFor === comment.commentId ? '작성중...' : '작성'}</button>
          </form>
        )}

        {comment.replies && comment.replies.length > 0 && isExpanded && (
          <ul className="mt-3 space-y-3">
            {comment.replies.map(r => (
              <CommentNode key={r.commentId} comment={r} depth={(depth || 0) + 1} />
            ))}
          </ul>
        )}
      </li>
    );
  };

  // helper: recursively add a reply under parentId
  const addReplyRecursive = (comments: BoardComment[], parentId: number, reply: BoardComment): boolean => {
    for (const c of comments) {
      if (c.commentId === parentId) {
        c.replies = c.replies || [];
        c.replies.push(reply);
        return true;
      }
      if (c.replies && c.replies.length) {
        if (addReplyRecursive(c.replies, parentId, reply)) return true;
      }
    }
    return false;
  };

  // helper: recursively remove comment by id
  const removeCommentRecursive = (comments: BoardComment[], id: number): boolean => {
    for (let i = comments.length - 1; i >= 0; i--) {
      if (comments[i].commentId === id) {
        comments.splice(i, 1);
        return true;
      }
      if (comments[i].replies && comments[i].replies.length) {
        if (removeCommentRecursive(comments[i].replies, id)) return true;
      }
    }
    return false;
  };

  // reply handlers
  const handleReplyToggle = (parentId: number) => {
    setOpenReplyParent(prev => prev === parentId ? null : parentId);
  };

  // reply input refs (uncontrolled) stored in replyRefs

  const handleReplySubmit = async (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    if (!post) return;
    const content = (replyRefs.current[parentId]?.value || '').trim();
    if (!content) return;
    setReplyLoadingFor(parentId);
    try {
      const res = await boardsService.createComment(post.postId, { content, parentCommentId: parentId });
      setPost(prev => {
        if (!prev) return prev;
        const newComments: BoardComment[] = JSON.parse(JSON.stringify(prev.comments || []));
        addReplyRecursive(newComments, parentId, res);
        return { ...prev, comments: newComments };
      });
      if (replyRefs.current[parentId]) replyRefs.current[parentId]!.value = '';
      setOpenReplyParent(null);
    } catch (err) {
      alert('대댓글 작성 실패');
      console.error('[boardsService.createComment - reply] 에러:', err);
    } finally {
      setReplyLoadingFor(null);
    }
  };

  // 좋아요
  const handleLike = async () => {
    if (!post) return;
    setLikeLoading(true);
    try {
      const res = await boardsService.likeBoard(post.postId);
      setPost((prev) => prev ? { ...prev, likes: res.likes, liked: res.liked, views: res.views } : prev);
      console.log('[boardsService.likeBoard] 응답:', res);
      try {
        const { addLikedPost, removeLikedPost } = await import('../../utils/myPageStore');
        const likedPost = {
          id: post.postId,
          type: 'board' as const,
          title: post.title,
          author: post.authorName,
          date: post.createdAt?.slice(0,10),
          likes: res.likes,
        };
        if (res.liked) addLikedPost(likedPost);
        else removeLikedPost(post.postId, 'board');
          try {
            const { getLikedPosts } = await import('../../utils/myPageStore');
            console.debug('[CommunityPage] after persist liked posts:', getLikedPosts().map(p => `${p.type}:${p.id}`));
          } catch (e) {}
      } catch (e) {
        console.error('Failed to persist liked board to localStorage', e);
      }
    } catch (err) {
      alert('좋아요 처리 실패');
      console.error('[boardsService.likeBoard] 에러:', err);
    } finally {
      setLikeLoading(false);
    }
  };

  

  // 댓글 작성
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !commentContent.trim()) return;
    setCommentLoading(true);
    setCommentError(null);
    try {
      const res = await boardsService.createComment(post.postId, { content: commentContent, parentCommentId: null });
      setPost((prev) => prev ? { ...prev, comments: [...prev.comments, res] } : prev);
      setCommentContent('');
      console.log('[boardsService.createComment] 응답:', res);
    } catch (err) {
      setCommentError('댓글 작성 실패');
      console.error('[boardsService.createComment] 에러:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  // 댓글 삭제
  const handleCommentDelete = async (commentId: number) => {
    if (!post) return;
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    setCommentToDelete(commentId);
    try {
      await boardsService.deleteComment(post.postId, commentId);
      setPost((prev) => {
        if (!prev) return prev;
        const newComments: BoardComment[] = JSON.parse(JSON.stringify(prev.comments || []));
        removeCommentRecursive(newComments, commentId);
        return { ...prev, comments: newComments };
      });
      console.log('[boardsService.deleteComment] 성공:', commentId);
    } catch (err) {
      alert('댓글 삭제 실패');
      console.error('[boardsService.deleteComment] 에러:', err);
    } finally {
      setCommentToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-[#0A0A0A] text-white">
        <p className="text-xl text-zinc-400 mb-4">로딩 중...</p>
      </div>
    );
  }
  if (error || !post) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-[#0A0A0A] text-white">
        <p className="text-xl text-zinc-400 mb-4">{error || '게시물을 찾을 수 없습니다.'}</p>
        <button onClick={() => navigate(-1)} className="text-blue-400 hover:underline">돌아가기</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] font-sans text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#050505] bg-[radial-gradient(#1E1E1E_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#312e81,transparent)]"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto pt-48 pb-20 px-4">
        <header className="mb-10">
          <button onClick={() => {
              const fromPath = (location.state as any)?.from as string | undefined;
              if (fromPath) navigate(fromPath);
              else if (window.history.length > 1) navigate(-1);
              else navigate('/community');
            }} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 group text-sm font-semibold">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            목록으로 돌아가기
          </button>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter leading-tight mb-5">{post.title}</h1>
            <div className="flex items-center justify-between gap-4 text-zinc-400 border-b border-zinc-800 pb-8">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden">
                  <img
                    src={post.authorProfileImageUrl || "/images/cat_logo.png"}
                    alt="Author"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/cat_logo.png'; }}
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-300">{post.authorName}</span>
                    <span className="text-sm">{post.createdAt?.slice(0, 10)}</span>
                    <span className="text-sm text-zinc-500 flex items-center gap-2">
                      <Eye size={14} /> <span className="text-zinc-400">조회수 {post.views ?? 0}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <button onClick={handleLike} disabled={likeLoading} className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors group ${post?.liked ? 'border-rose-500 text-rose-500' : 'border-zinc-800 text-zinc-400 hover:text-white'}`} title={post?.liked ? '좋아요 취소' : '좋아요'} aria-label={post?.liked ? '좋아요 취소' : '좋아요'}>
                        {likeLoading ? '...' : <Heart size={14} className={post?.liked ? 'fill-current text-rose-500' : 'group-hover:text-rose-500'} />}
                      </button>
                      <span className="text-sm font-semibold text-zinc-300">{post?.likes ?? 0}</span>
                    </div>
                

                {isAuthor && (
                  <>
                    <button onClick={() => navigate(`/community/edit/${post.postId}`)} className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:border-blue-500 hover:text-blue-400" title="수정" aria-label="수정">
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleteLoading}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:border-rose-500 hover:text-rose-500 disabled:opacity-50 ml-1"
                      title={deleteLoading ? '삭제중...' : '삭제'}
                      aria-label={deleteLoading ? '삭제중' : '삭제'}
                    >
                      <Trash2 size={14} />
                    </button>
                    {deleteError && <span className="text-xs text-red-400 ml-1">{deleteError}</span>}
                  </>
                )}
              </div>
            </div>
        </header>

        <main className="bg-transparent min-h-[300px]">
            <ReactMarkdown components={{
              h3: (props) => <h3 className="text-2xl font-bold text-white mt-12 mb-4 border-b border-zinc-800 pb-3" {...props} />,
              p: (props) => <p className="text-lg text-zinc-300 leading-relaxed my-6" {...props} />,
              ul: (props) => <ul className="list-disc list-inside my-6 pl-4 space-y-3" {...props} />,
              code(props) {
                const { inline, className, children, ...rest } = props as any;
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <div className="my-8 rounded-lg overflow-hidden bg-[#0d1117] border border-zinc-800">
                    <div className="px-4 py-2 bg-zinc-800 text-xs text-zinc-400 font-mono flex justify-between items-center">
                      <span>{match[1]}</span>
                      <button onClick={() => navigator.clipboard.writeText(String(children))} className="text-xs font-semibold hover:text-white transition-colors">Copy</button>
                    </div>
                    <SyntaxHighlighter style={atomDark} language={match[1]} PreTag="div" customStyle={{ margin: 0, padding: '1.5rem', backgroundColor: 'transparent' }} showLineNumbers={true}>
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className="text-amber-400 bg-zinc-800/80 rounded px-1.5 py-1 text-sm font-mono" {...rest}>{children}</code>
                );
              }
            }}>
              {post.content}
            </ReactMarkdown>
            {/* 이미지 */}
            {post.imageUrl && (
              <div className="my-8 flex justify-center relative">
                {!imgError ? (
                  <img
                    key={`${post.imageUrl}?r=${imgRetryCount}`}
                    src={`${post.imageUrl}?r=${imgRetryCount}`}
                    alt="게시글 이미지"
                    className="max-h-96 rounded-lg border border-zinc-800"
                    onError={(e) => {
                      const failedUrl = (e.currentTarget as HTMLImageElement).src;
                      console.error('[CommunityDetail] 이미지 로드 실패 URL:', failedUrl);
                      setImgError(true);
                    }}
                  />
                ) : (
                  <div className="w-full flex flex-col items-center gap-2">
                    <img src="/images/image_placeholder.png" alt="이미지 없음" className="max-h-96 rounded-lg border border-zinc-800" />
                    <div className="flex items-center gap-2">
                          <button
                        onClick={() => {
                          // retry: bump query param to bypass caches and try loading again
                          setImgRetryCount(c => c + 1);
                          setImgError(false);
                          console.log('[CommunityDetail] 이미지 재시도', post.imageUrl);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                      >
                        재시도
                      </button>
                      <a href={post.imageUrl} target="_blank" rel="noreferrer" className="text-sm text-zinc-400 hover:underline">원본 열기</a>
                    </div>
                  </div>
                )}
              </div>
            )}
        </main>

        {/* 댓글 영역 */}
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">댓글</h2>
          <form onSubmit={handleCommentSubmit} className="flex gap-2 mb-6">
            <input
              type="text"
              value={commentContent}
              onChange={e => setCommentContent(e.target.value)}
              className="flex-1 px-4 py-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-blue-500"
              placeholder="댓글을 입력하세요"
              disabled={commentLoading}
              required
            />
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50" disabled={commentLoading}>{commentLoading ? '작성중...' : '작성'}</button>
          </form>
          {commentError && <div className="text-red-400 mb-2">{commentError}</div>}
          <ul className="space-y-4">
            {post.comments.map((c) => (
              <CommentNode key={c.commentId} comment={c} />
            ))}
          </ul>
        </section>

        <footer className="mt-12 pt-8 border-t border-zinc-800 flex justify-end items-center gap-4">
            <button className="flex items-center gap-2 text-zinc-400 hover:text-white bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-lg transition-colors group" disabled>
              <MessageCircle size={14} className="group-hover:text-blue-400 transition-colors" /><span className="font-semibold text-sm">{post.comments.length}</span>
            </button>
        </footer>
      </div>
    </div>
  );
};
