import React from 'react';
import { X, LogOut, Home, Info, BookOpen, Mic, User, Users, MessageSquare } from 'lucide-react';
import Logo from './Logo';
import type { SideNavigationProps } from './Header.types';
import { useHeader } from './useHeader';

const SideNavigation: React.FC<SideNavigationProps> = ({ isOpen, setIsOpen }) => {
  const { isLoggedIn, nickname, profileImage, handleLogout, handleNav, navigate } = useHeader(setIsOpen);

  const MENU = [
    { index: '01', title: 'HOME', path: '/', icon: <Home size={18} />, items: ['메인페이지'] },
    { index: '02', title: 'ABOUT', path: '/about', icon: <Info size={18} />, items: ['다답(DADAP) 서비스란?'] },
    { index: '03', title: 'STUDY', path: '/study', icon: <BookOpen size={18} />, items: ['데이터 베이스(DB)', '운영체제(OS)', '자료구조 및 알고리즘(DSA)', '프론트엔드(FE)', '백엔드(BE)', '네트워크(NW)'] },
    { index: '04', title: 'COMMUNITY', path: '/community', icon: <MessageSquare size={18} />, items: ['커뮤니티'] },
    { index: '05', title: 'INTERVIEW', path: '/interview', icon: <Mic size={18} />, items: ['경험 면접', 'IT 기술 면접'] },
    { index: '06', title: 'P2P INTERVIEW', path: '/p2p', icon: <Users size={18} />, items: ['1:1 인터뷰'] },
    {
      index: '07',
      title: 'MY PAGE',
      path: '/mypage',
      icon: <User size={18} />,
      items: ['내 포트폴리오', 'AI 면접 기록', 'CS 면접 기록', '저장한 문제', '좋아요 한 글', '내가 쓴 글', '계정 설정'],
    },
  ];

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className={`fixed inset-0 bg-bg-main/80 backdrop-blur-sm z-[205] transition-opacity duration-500 pointer-events-auto
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* 좌측 사이드바 본체 */}
      <aside
        className={`fixed top-0 left-0 h-full w-[360px] bg-bg-surface backdrop-blur-3xl border-r border-border-main z-[210] transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] pointer-events-auto shadow-[20px_0_50px_rgba(0,0,0,0.1),inset_0_0_20px_rgba(255,255,255,0.02)] flex flex-col custom-scrollbar
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* 사이드바 헤더 */}
        <div className="flex items-center justify-between py-6 px-10 border-b border-border-subtle bg-bg-card">
          <Logo />
          <button
            onClick={() => setIsOpen(false)}
            className="text-text-muted hover:text-text-main transition-colors bg-bg-card p-2 rounded-full hover:bg-bg-surface hover:shadow-[0_0_15px_rgba(var(--accent-primary-rgb),0.2)]"
          >
            <X size={20} />
          </button>
        </div>

        {/* 메뉴 리스트 */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar py-6 px-8 space-y-8 bg-transparent">
          {MENU.map((group) => (
            <div key={group.index} className="space-y-6">
              <div className="flex items-center gap-4 text-text-sub group-hover:text-text-main transition-colors">
                <span className="text-xs font-black text-accent-primary tracking-widest drop-shadow-[0_0_8px_rgba(var(--accent-primary-rgb),0.5)]">{group.index}</span>
                <div className="h-px flex-1 bg-gradient-to-r from-border-main to-transparent"></div>
                <div
                  className="flex items-center gap-2 text-text-main cursor-pointer"
                  onClick={() => {
                    if (group.title === 'STUDY') {
                      handleNav('/study', 'all');
                    } else {
                      handleNav(group.path);
                    }
                  }}
                >
                  {group.icon}
                  <h3 className="text-sm font-black tracking-widest uppercase">{group.title}</h3>
                </div>
              </div>
              <ul className="space-y-2 pl-12 border-l border-border-subtle ml-3">
                {group.items.map((item, i) => (
                  <React.Fragment key={i}>
                    <li
                      onClick={() => {
                        if (group.title === 'STUDY') {
                          handleNav('/study', item);
                        } else if (group.title === 'INTERVIEW') {
                          if (item === '경험 면접') {
                            navigate('/interview/select-document');
                            setIsOpen(false);
                          } else if (item === 'IT 기술 면접') {
                            navigate('/interview/select-category');
                            setIsOpen(false);
                          }
                        } else if (group.title === 'MY PAGE') {
                          if (item === '내 포트폴리오') {
                            navigate('/mypage/docs');
                          } else if (item === 'AI 면접 기록') {
                            navigate('/mypage/ai-log');
                          } else if (item === 'CS 면접 기록') {
                            navigate('/mypage/cs-log');
                          } else if (item === '저장한 문제') {
                            navigate('/mypage/saved');
                          } else if (item === '좋아요 한 글') {
                            navigate('/mypage/likes');
                          } else if (item === '내가 쓴 글') {
                            navigate('/mypage/stories');
                          } else if (item === '계정 설정') {
                            navigate('/mypage/settings');
                          }
                          setIsOpen(false);
                        } else {
                          handleNav(group.path);
                        }
                      }}
                      className="text-base font-medium text-text-sub hover:text-text-main cursor-pointer transition-all flex items-center gap-3 group/item py-1 hover:translate-x-1 hover:bg-bg-card rounded-r-lg pl-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-text-muted group-hover/item:bg-accent-primary group-hover/item:shadow-[0_0_8px_rgba(var(--accent-primary-rgb),0.8)] transition-all" />
                      <span className="flex-1">{item}</span>
                    </li>
                  </React.Fragment>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* 하단 프로필 영역 */}
        <div className="py-6 px-8 border-t border-border-subtle bg-bg-card">
          {isLoggedIn ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 cursor-pointer group" onClick={() => handleNav('/mypage')}>
                <div className="w-12 h-12 rounded-full bg-bg-surface/50 border border-border-main flex items-center justify-center overflow-hidden group-hover:border-accent-primary group-hover:shadow-[0_0_15px_rgba(var(--accent-primary-rgb),0.4)] transition-all backdrop-blur-sm">
                  <img
                    src={profileImage || '/images/cat_mascot.png'}
                    alt="User"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/cat_mascot.png';
                    }}
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-sm font-bold text-text-main group-hover:text-accent-primary transition-colors">{nickname || 'User'}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="text-text-muted hover:text-red-500 transition-colors p-2 hover:bg-bg-card rounded-lg backdrop-blur-sm" title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNav('/login')}
              className="w-full py-4 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white font-black tracking-widest uppercase text-xs transition-all shadow-[0_0_20px_rgba(var(--accent-primary-rgb),0.3)] active:scale-[0.98]"
            >
              Sign In
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default SideNavigation;
