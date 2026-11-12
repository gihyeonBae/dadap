import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FilePlus, Loader2, Trash2 } from 'lucide-react';
import { portfolioService, type PortfolioFile } from '../../api/services/portfolioService';
import { boardsService } from '../../api/myBoardsService';
import { useLocation, useNavigate } from 'react-router-dom';
import { type RootState } from '../../redux/store';
import FileItem from '../../components/MyPage/FileItem';
import MyPageHeader from '../../components/MyPage/MyPageHeader';
import ModalFrame from '../../components/starter-modals/ModalFrame';
import { getLikedPosts, type LikedPost, removeLikedPost } from '../../utils/myPageStore';
import Step2UploadForm from '../../components/starter-modals/Step2UploadForm';

const MyPortfolio: React.FC = () => {
  const { userId } = useSelector((state: RootState) => state.auth);
  const [files, setFiles] = useState<PortfolioFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'RESUME' | 'PORTFOLIO'>('RESUME');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'RESUME' | 'PORTFOLIO'>('RESUME');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'DOCS' | 'IMAGES'>('DOCS');
  const [imageCategory, setImageCategory] = useState<'COMMUNITY' | 'STUDY'>('COMMUNITY');
  const [likedPosts, setLikedPosts] = useState<LikedPost[]>([]);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchFiles = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const response = await portfolioService.getPortfolios(userId, activeTab);
      
      if (response && Array.isArray(response.portfolios)) {
        setFiles(response.portfolios);
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error("Failed to fetch portfolio files:", error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    // load liked posts for Images mode
    setLikedPosts(getLikedPosts());

    // update when liked posts change elsewhere (like/from community scrap)
    const handler = () => setLikedPosts(getLikedPosts());
    window.addEventListener('myPage:likedUpdated', handler as EventListener);
    return () => window.removeEventListener('myPage:likedUpdated', handler as EventListener);
  }, []);
  useEffect(() => {
    fetchFiles();
  }, [userId, activeTab]);

  // If navigated with ?type=board&id=..., try to show the board's image in modal
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const type = q.get('type');
    const idStr = q.get('id');
    if (type === 'board' && idStr) {
      const id = Number(idStr);
      if (!isNaN(id)) {
        (async () => {
          try {
            const board = await boardsService.getBoard(id);
            if (board?.imageUrl) {
              setModalImageUrl(board.imageUrl);
              setIsImageModalOpen(true);
            } else {
              // no image on board, fallback to community detail
              navigate(`/community/${id}`);
            }
          } catch (e) {
            console.error('failed to fetch board for image modal', e);
            navigate(`/community/${id}`);
          }
        })();
      }
    }
  }, [location.search]);

  const handleUploadClick = (type: 'RESUME' | 'PORTFOLIO') => {
    setUploadType(type);
    setIsUploadModalOpen(true);
  };

  const handleUploadConfirm = () => {
    setIsUploadModalOpen(false);
    fetchFiles(); // Refresh list after successful upload
  };

  const handleDelete = async (id: number) => {
    if (!userId) return;
    if (window.confirm("정말로 이 파일을 삭제하시겠습니까?")) {
      try {
        await portfolioService.deletePortfolio(id, userId);
        setFiles(prev => prev.filter(f => f.id !== id));
      } catch (error) {
        console.error("Failed to delete portfolio:", error);
        alert("파일 삭제 중 오류가 발생했습니다.");
      }
    }
  };

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
        title="DOCS"
        description="Manage your resumes and portfolios in one place."
      >
        <div className="flex gap-3">
          <button 
            onClick={() => handleUploadClick('RESUME')}
            className="group flex items-center gap-2 bg-transparent text-blue-400 border border-blue-500/50 px-5 py-3 rounded-2xl font-bold hover:bg-blue-500 hover:text-white transition-all shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            <FilePlus size={18} />
            <span className="text-sm text-nowrap">Add Resume</span>
          </button>
          <button 
            onClick={() => handleUploadClick('PORTFOLIO')}
            className="group flex items-center gap-2 bg-transparent text-purple-400 border border-purple-500/50 px-5 py-3 rounded-2xl font-bold hover:bg-purple-500 hover:text-white transition-all shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          >
            <Upload size={18} />
            <span className="text-sm text-nowrap">Add Portfolio</span>
          </button>
        </div>
      </MyPageHeader>

      {/* Mode switch: Docs / Images */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4">
          {(['DOCS', 'IMAGES'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`px-4 py-2 rounded-2xl font-semibold text-sm transition-all ${viewMode === m ? 'bg-white/6 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              {m === 'DOCS' ? '문서' : '이미지'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
          <div className="flex items-center gap-8 mb-8 border-b border-white/10 px-2">
            {viewMode === 'DOCS' ? (
              (['RESUME', 'PORTFOLIO'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-bold tracking-widest uppercase transition-all relative ${
                    activeTab === tab ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab === 'RESUME' ? '자기소개서' : '포트폴리오'}
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" 
                    />
                  )}
                </button>
              ))
            ) : (
              // Images category tabs: ALL, STUDY, COMMUNITY
              (['ALL', 'STUDY', 'COMMUNITY'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setImageCategory(c as any)}
                  className={`pb-4 text-sm font-bold tracking-widest uppercase transition-all relative ${imageCategory === c ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {c === 'COMMUNITY' ? '커뮤니티' : c === 'STUDY' ? '학습' : 'ALL'}
                  {imageCategory === c && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" 
                    />
                  )}
                </button>
              ))
            )}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative min-h-[400px] p-1 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent shadow-2xl"
          >
            <div className="h-full w-full bg-zinc-950/80 backdrop-blur-3xl rounded-[2.4rem] p-8 md:p-12">
              {viewMode === 'DOCS' ? (
                isLoading ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <Loader2 className="animate-spin text-indigo-500" size={40} />
                    <p className="text-zinc-500 animate-pulse">Loading documents...</p>
                  </div>
                ) : files.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence mode="popLayout">
                      {files.map((file) => (
                        <FileItem 
                          key={file.id} 
                          file={file} 
                          onDelete={handleDelete}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-white/[0.03] flex items-center justify-center text-zinc-700 mb-6">
                      <Upload size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-300 mb-2">No {activeTab === 'RESUME' ? 'resumes' : 'portfolios'}</h3>
                    <p className="text-zinc-500 max-w-xs mx-auto">
                      Start by adding your first {activeTab === 'RESUME' ? 'resume' : 'portfolio'}.
                    </p>
                  </div>
                )
              ) : (
                // Images view: show liked posts filtered by category
                <div>
                  {(() => {
                    const filtered = likedPosts.filter(p => {
                      if (imageCategory === 'ALL') return p.type === 'board' || p.type === 'study';
                      if (imageCategory === 'COMMUNITY') return p.type === 'board';
                      return p.type === 'study';
                    });
                    if (filtered.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                          <p className="text-zinc-500">No liked {imageCategory === 'COMMUNITY' ? 'community' : imageCategory === 'STUDY' ? 'study' : 'items'} images yet.</p>
                        </div>
                      );
                    }
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {filtered.map((item) => (
                          <div key={`${item.type}-${item.id}`} className="bg-zinc-900/60 rounded-xl p-4 flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className="font-bold text-white">{item.title}</h4>
                                <div className="text-zinc-500 text-sm">{item.author ?? ''} • {item.date ?? ''}</div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      try {
                                        removeLikedPost(item.id, item.type as any);
                                        setLikedPosts(getLikedPosts());
                                      } catch (e) { console.error('failed to remove liked post', e); }
                                    }}
                                    title="Remove"
                                    className="w-9 h-9 rounded-md flex items-center justify-center border border-white/10 bg-white/5 text-zinc-300 hover:bg-rose-600/10 hover:text-rose-400 hover:border-rose-400 transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>

                                  <button
                                    onClick={async () => {
                                      if (item.type === 'board') {
                                        try {
                                          const b = await boardsService.getBoard(item.id);
                                          if (b?.imageUrl) {
                                            setModalImageUrl(b.imageUrl);
                                            setIsImageModalOpen(true);
                                          } else {
                                            navigate(`/community/${item.id}`);
                                          }
                                        } catch (e) {
                                          console.error('failed to open board image', e);
                                          navigate(`/community/${item.id}`);
                                        }
                                      } else {
                                        const url = item.extra?.imageUrl as string | undefined;
                                        if (url) {
                                          setModalImageUrl(url);
                                          setIsImageModalOpen(true);
                                        } else {
                                          navigate(`/study/${item.id}`);
                                        }
                                      }
                                    }}
                                    className="px-3 py-1 rounded-lg bg-white/6 text-sm hover:bg-white/10"
                                  >
                                    View
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
          </div>
        </motion.div>

        {/* Upload Modal */}
        <ModalFrame isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)}>
          <div className="w-full max-w-xl mx-auto py-4">
            <Step2UploadForm 
              type={uploadType === 'RESUME' ? '자기소개서' : '포트폴리오'} 
              uploadType={uploadType}
              onBack={() => setIsUploadModalOpen(false)} 
              onConfirm={handleUploadConfirm} 
            />
          </div>
        </ModalFrame>
        <ModalFrame isOpen={isImageModalOpen} onClose={() => { setIsImageModalOpen(false); setModalImageUrl(null); navigate('/mypage/docs'); }}>
          <div className="w-full flex items-center justify-center p-6">
            {modalImageUrl ? (
              // show responsive image
              <img src={modalImageUrl} alt="Board Image" className="max-h-[70vh] max-w-full rounded-lg border border-zinc-800 object-contain" />
            ) : (
              <p className="text-zinc-400">이미지를 불러올 수 없습니다.</p>
            )}
          </div>
        </ModalFrame>
    </motion.div>
  );
};

export default MyPortfolio;


