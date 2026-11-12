import type { Variants } from 'framer-motion';

export const SELECT_DOC_VARIANTS: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export const STYLES = {
  container: "text-text-main flex flex-col",
  backButton: "flex items-center gap-2 text-text-muted hover:text-text-main transition-colors group px-8 pt-7",
  contentWrapper: "p-8 pt-4 pb-12 flex flex-col",
  headerWrapper: "mb-8 text-center flex flex-col items-center",
  title: "text-xl font-bold text-text-main mb-2 tracking-tight",
  description: "text-text-sub text-sm leading-relaxed break-keep",
  buttonGrid: "flex flex-col gap-3.5 mb-2",
  docButtonBase: "flex items-center justify-between p-5 rounded-2xl bg-bg-card border border-border-subtle hover:bg-bg-surface transition-all group",
  iconWrapper: "p-3 rounded-xl transition-colors",
  label: "font-bold text-base text-text-main block",
  subLabel: "text-[10px] text-text-muted font-medium italic",
  arrowIcon: "w-5 h-5 text-text-muted/20 group-hover:translate-x-1 group-hover:text-text-main transition-all"
};
