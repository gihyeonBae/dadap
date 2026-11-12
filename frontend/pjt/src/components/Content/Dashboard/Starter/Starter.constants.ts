import type { CardItem } from './Starter.types';

export const STARTER_STYLES = {
  container: "relative flex flex-col items-center text-text-main font-sans h-auto py-12 bg-transparent", 
  cardWrapper: "relative z-10 flex items-center justify-center w-full max-w-screen-2xl mx-auto py-[100px] px-24 overflow-visible [perspective:1200px] [transform-style:preserve-3d]",
  cardBase: `
    group relative flex flex-col items-center justify-center
    rounded-[3rem] overflow-hidden
    appearance-none outline-none focus:outline-none select-none
    bg-bg-card backdrop-blur-2xl
    shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]
    transition-all duration-700
    tracking-tight
  `,
  startIndicator: "px-6 py-2.5 rounded-full bg-white/5 dark:bg-black/20 border border-border-main text-[13px] font-black tracking-[0.2em]",
  gridPattern: "absolute inset-0 opacity-[0.05] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent)]",
  innerGlow: "absolute inset-0 rounded-[3rem] pointer-events-none opacity-0 transition-opacity duration-700 shadow-[inset_0_40px_120px_-10px_rgba(255,255,255,0.05)]",
  systemLabel: "hidden",
  headlineContainer: "relative z-20 text-center mb-6",
  headlineTitle: "text-3xl md:text-4xl font-black tracking-tight text-text-main mb-3 leading-tight",
  headlineSubtitle: "text-text-sub text-xs md:text-sm font-bold tracking-[0.4em] uppercase opacity-80",
  
  cardTag: "text-[10px] font-bold tracking-[0.3em] uppercase bg-white/5 px-2 py-0.5 rounded-full border border-white/10",
  cardTitle: "text-3xl font-black tracking-tight text-text-main transition-all duration-500",
  
  cardDescription: "absolute inset-0 flex items-center justify-center text-base font-medium leading-relaxed max-w-[85%] mx-auto opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 pointer-events-none whitespace-pre-line tracking-tight",
  
  startButtonText: "mt-8 flex items-center gap-3 text-xs font-bold tracking-[0.4em] text-text-sub transition-all duration-300",
  
  startButtonIconContainer: "w-10 h-10 rounded-full border border-border-main flex items-center justify-center transition-all duration-500 shadow-xl",
  
  floatingAnimation: `
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    .animate-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .animate-float {
      animation: float 3.5s ease-in-out infinite;
    }
    .animate-shimmer {
      animation: shimmer 3s infinite linear;
    }
  `,
};

export const STARTER_CARD_DATA: CardItem[] = [
  { 
    id: 'docs', 
    tag: 'SYSTEM 01', 
    title: '경험 면접', 
    desc: `자기소개서와 포트폴리오
    맥락 분석과 디테일한 질문`, 
    img: '/images/interview_docs.png',
    bg: '', 
    accent: 'text-blue-500', 
    glow: '', 
    hoverGlow: '',
  },
  { 
    id: 'cs', 
    tag: 'SYSTEM 02', 
    title: 'IT 기술 면접', 
    desc: `CS 핵심 이론
    심층 검증`, 
    img: '/images/interview_cs.png',
    bg: '', 
    accent: 'text-purple-500', 
    glow: '', 
    hoverGlow: '',
  },
  { 
    id: 'p2p', 
    tag: 'SYSTEM 03', 
    title: 'P2P 스터디룸', 
    desc: `다른 유저와의
    면접 스터디 플랫폼`, 
    img: '/images/interview_p2p.png',
    bg: '', 
    accent: 'text-orange-500', 
    glow: '', 
    hoverGlow: '',
  },
];
