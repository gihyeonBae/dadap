import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FolderOpen, Heart, MessageSquare, Settings, LogOut 
} from 'lucide-react'; 
import type { RootState } from '../../redux/store';
import { setLogout } from '../../redux/slices/authSlice';

const MENU_ITEMS = [
  { id: 'docs', icon: <FolderOpen size={18} />, label: "내 문서", path: "/mypage/docs" },
  { id: 'likes', icon: <Heart size={18} />, label: "좋아요 한 글", path: "/mypage/likes", color: "group-hover:text-accent-primary" },
  { id: 'posts', icon: <MessageSquare size={18} />, label: "내가 쓴 글", path: "/mypage/stories" },
];

const MyPageSidebar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { nickname, profileImage, email } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(setLogout());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6, 
        ease: [0.16, 1, 0.3, 1] as any 
      } 
    }
  };

  return (
    <aside className="w-full lg:w-80 shrink-0 flex">
      <motion.div 
        variants={itemVariants} 
        initial="hidden"
        animate="visible"
        className="glass-ui w-full p-8 rounded-[2.5rem] bg-bg-surface border-border-main flex flex-col h-full shadow-lg"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-28 h-28 rounded-full p-1 border border-border-main mb-6 relative group cursor-pointer overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-tr from-accent-primary via-accent-secondary to-accent-neon opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
            <img 
              src={profileImage || "/images/cat_mascot.png"} 
              alt="Profile" 
              className="w-full h-full object-cover rounded-full bg-bg-main relative z-10" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/cat_mascot.png";
              }}
            />
          </div>
          <div className="text-center">
            <h3 className="font-black tracking-tighter uppercase text-text-main mb-1">{nickname || '사용자'}</h3>
            <span className="px-3 py-1 rounded-full bg-bg-main border border-border-subtle text-xs font-black tracking-widest text-accent-primary uppercase shadow-md">
              {email || '멤버'}
            </span>
          </div>
        </div>

        <nav className="space-y-1 mb-10">
          {MENU_ITEMS.map((item) => (
            <button 
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-4 w-full p-4 rounded-2xl transition-all group hover:bg-bg-main border border-transparent hover:border-border-subtle"
            >
              <span className={`text-text-sub transition-colors ${item.color || 'group-hover:text-text-main'}`}>{item.icon}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-text-sub group-hover:text-text-main transition-colors">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-border-subtle space-y-2">
          <button 
            onClick={() => navigate('/mypage/settings')}
            className="flex items-center gap-3 w-full p-4 rounded-2xl text-text-muted hover:text-text-main hover:bg-bg-main transition-all text-sm font-bold tracking-tight group"
          >
            <Settings size={18} className="group-hover:rotate-45 transition-transform" />
            계정 설정
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-4 rounded-2xl text-rose-500 hover:text-rose-400 hover:bg-bg-main border border-transparent transition-all text-sm font-bold tracking-tight"
          >
            <LogOut size={18} />
            로그아웃
          </button>
        </div>
      </motion.div>
    </aside>
  );
};

export default MyPageSidebar;
