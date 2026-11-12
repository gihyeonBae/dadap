import { Home, Info, BookOpen, Mic, User } from 'lucide-react';
import type { MenuItem } from './Header.types';
import type { Variants } from 'framer-motion';

export const HEADER_MENU: MenuItem[] = [
  { index: '01', title: 'HOME', path: '/', icon: Home, items: ['Dashboard'] },
  { index: '02', title: 'ABOUT', path: '/about', icon: Info, items: ['Service Intro'] },
  { index: '03', title: 'STUDY', path: '/study', icon: BookOpen, items: ['DB', 'OS', 'DSA', 'FE', 'BE', 'NW'] },
  { index: '04', title: 'INTERVIEW', path: '/interview', icon: Mic, items: ['AI Mock Interview', 'CS Technical Interview'] },
  { index: '05', title: 'MY PAGE', path: '/mypage', icon: User, items: ['Docs', 'History'] },
];

export const LOGO_ANIMATION: Variants = {
  hidden: { pathLength: 0, opacity: 0.8 },
  visible: {
    pathLength: [0, 1, 1, 0],
    opacity: [0.8, 1, 1, 0.8],
    transition: {
      duration: 8,
      ease: "easeInOut",
      repeat: Infinity,
      repeatDelay: 1.5
    }
  }
};

export const HEADER_STYLES = {
  container: "fixed top-0 left-0 w-full px-6 md:px-12 py-4 md:py-6 flex justify-between items-center z-[200] bg-bg-main/80 backdrop-blur-md border-b border-border-subtle transition-colors duration-300",
  triggerBtn: "group w-11 h-11 p-2 bg-bg-card border border-border-main hover:border-accent-primary transition-all duration-300 rounded-xl flex flex-col justify-center items-center gap-[5px]",
  aboutLink: "absolute left-1/2 -translate-x-1/2 hidden lg:block text-sm font-black italic uppercase tracking-widest text-text-muted hover:text-text-main transition-all group",
  profileBtn: "flex items-center gap-3 group text-left p-1 rounded-full hover:bg-bg-card transition-all",
  profileImg: "w-10 h-10 rounded-full bg-bg-surface border border-border-main overflow-hidden group-hover:border-accent-primary group-hover:shadow-[0_0_10px_rgba(var(--accent-primary-rgb),0.5)] transition-all",
  navLink: "text-sm font-black text-text-sub hover:text-text-main transition-all uppercase tracking-[0.2em]"
};
