import React from 'react';
import { Cpu, Globe, Database, Layers, Code2, Monitor } from 'lucide-react';

// 카테고리 데이터 - Semantic Variables 활용
export const CATEGORIES = [
  { id: 'os', name: '운영체제', icon: <Cpu />, colorToken: 'text-blue-500', bgToken: 'bg-blue-500/10', borderToken: 'border-blue-500/30' }, 
  { id: 'network', name: '네트워크', icon: <Globe />, colorToken: 'text-green-500', bgToken: 'bg-green-500/10', borderToken: 'border-green-500/30' }, 
  { id: 'ds', name: '자료구조/알고리즘', icon: <Layers />, colorToken: 'text-purple-500', bgToken: 'bg-purple-500/10', borderToken: 'border-purple-500/30' }, 
  { id: 'db', name: '데이터베이스', icon: <Database />, colorToken: 'text-yellow-500', bgToken: 'bg-yellow-500/10', borderToken: 'border-yellow-500/30' }, 
  { id: 'backend', name: '백엔드', icon: <Code2 />, colorToken: 'text-red-500', bgToken: 'bg-red-500/10', borderToken: 'border-red-500/30' }, 
  { id: 'frontend', name: '프론트엔드', icon: <Monitor />, colorToken: 'text-cyan-500', bgToken: 'bg-cyan-500/10', borderToken: 'border-cyan-500/30' }, 
];

export const CATEGORY_SELECT_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

export const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as any } 
  }
};

export const STYLES = {
  backButton: "flex items-center gap-2 text-text-muted hover:text-text-main transition-colors group",
  headerContainer: "mb-5 text-center animate-in slide-in-from-top-2 duration-300",
  title: "text-text-main text-xl font-bold mb-1 tracking-tight",
  description: "text-text-muted text-xs font-medium",
  categoryGrid: "grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100",
  categoryItemBase: "relative flex flex-col items-center justify-center p-4 rounded-3xl border bg-bg-card border-border-subtle transition-all duration-300 group min-h-[100px] hover:scale-[1.02]",
  categoryItemIconWrapper: "mb-2 transition-transform group-hover:scale-110",
  categoryItemName: "font-bold text-sm text-text-muted group-hover:text-text-main",
  modeSelectContainer: "flex-1 flex flex-col items-center animate-in zoom-in duration-500",
  selectedCategoryCard: "w-full flex items-center justify-between p-3.5 px-4 rounded-xl border border-border-subtle bg-bg-card mb-6 animate-in slide-in-from-bottom-2 duration-300",
  selectedCategoryIconWrapper: "flex items-center gap-3",
  selectedCategoryIcon: "w-4 h-4",
  selectedCategoryName: "text-xs font-bold text-text-main",
  modeButtonGrid: "grid grid-cols-2 gap-3 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200",
  modeButtonBase: "group relative flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.01] text-center",
  modeButtonIconWrapper: "mb-2 p-2.5 rounded-full transition-transform group-hover:scale-105",
  modeButtonTitle: "text-sm font-bold text-text-main",
  modeButtonDescription: "text-[10px] text-text-muted text-center leading-tight mt-1"
};
