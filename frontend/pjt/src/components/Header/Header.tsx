import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Sun, Moon } from 'lucide-react';
import type { RootState } from '../../redux/store';
import { setLogout } from '../../redux/slices/authSlice';
import Logo from './Logo';
import SideNavigation from './SideNavigation';

interface HeaderProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  isChatVisible: boolean;
  setIsChatVisible: (val: boolean) => void;
  isInterviewPage: boolean;
}

const Header: React.FC<HeaderProps> = ({ isOpen, setIsOpen, isInterviewPage }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isLoggedIn, nickname, profileImage } = useSelector((state: RootState) => state.auth);

  // Theme management logic
  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (localStorage.getItem('theme') as 'dark' | 'light') || 'dark'
  );

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  if (isInterviewPage) {
    return null;
  }

  const handleLogout = () => {
    dispatch(setLogout());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userInfo');
    navigate('/', { replace: true });
  };

  const headerClasses = `fixed top-0 left-0 w-full px-12 py-6 flex justify-between items-center z-[200] bg-bg-main border-b border-border-subtle transition-colors duration-300`;

  return (
    <header className={headerClasses}>
      {/* Left: Sidebar Trigger & Logo */}
      <div className="flex items-center gap-6 pointer-events-auto">
        
        {/* 햄버거 버튼 */}
        <button 
          onClick={() => setIsOpen(true)}
          className="group w-11 h-11 p-2 bg-bg-card border border-border-main hover:bg-bg-surface hover:border-accent-primary/30 transition-all duration-300 rounded-xl pointer-events-auto backdrop-blur-md flex flex-col justify-center items-center gap-[5px]"
        >
           <span className="w-3.5 h-[2px] bg-text-main rounded-full group-hover:w-7 group-hover:bg-accent-primary transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]"></span>
           <span className="w-3.5 h-[2px] bg-text-main rounded-full group-hover:w-7 group-hover:bg-accent-primary transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] delay-75"></span>
           <span className="w-3.5 h-[2px] bg-text-main rounded-full group-hover:w-7 group-hover:bg-accent-primary transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] delay-150"></span>
        </button>

        <SideNavigation isOpen={isOpen} setIsOpen={setIsOpen} />
        
        <Logo className="text-text-main text-3xl" />
      </div>

      {/* Center: About Link */}
      <button 
        onClick={() => navigate('/about')}
        className="absolute left-1/2 -translate-x-1/2 pointer-events-auto text-sm font-black italic uppercase tracking-widest text-text-sub hover:text-text-main hover:drop-shadow-[0_0_8px_rgba(var(--accent-primary-rgb),0.5)] transition-all group"
      >
        <span className="group-hover:text-accent-primary transition-colors">What is</span> DADAP?
      </button>

      {/* Right: Auth Navigation */}
      <div className="flex items-center gap-6 pointer-events-auto">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-transparent text-text-muted hover:text-text-main transition-all duration-300"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {isLoggedIn ? (
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/mypage')}
              className="flex items-center gap-3 group text-left p-1 rounded-full hover:bg-bg-card transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-bg-surface border border-border-main overflow-hidden group-hover:border-accent-primary group-hover:shadow-[0_0_10px_rgba(var(--accent-primary-rgb),0.5)] transition-all">
                <img 
                  src={profileImage || "/images/cat_mascot.png"} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                  onError={(e) => { (e.target as HTMLImageElement).src = "/images/cat_mascot.png"; }}
                />
              </div>
              <div className="flex flex-col justify-center">
                  <p className="text-base font-bold text-text-main leading-tight group-hover:text-accent-primary transition-colors">
                      {nickname || 'User'}
                  </p>
              </div>
            </button>
            
            <button 
              onClick={handleLogout}
              className="text-[10px] font-black text-text-muted hover:text-text-main uppercase tracking-widest transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <nav className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="text-xs font-black text-text-sub hover:text-text-main transition-all uppercase tracking-[0.2em]">Log In</button>
            <span className="text-text-muted/20 text-xs">|</span>
            <button onClick={() => navigate('/signup')} className="text-xs font-black text-text-sub hover:text-text-main transition-all uppercase tracking-[0.2em]">Join Us</button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;