export const MY_PORTFOLIO_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

export const LIST_CONTAINER_VARIANTS = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.5 }
};

export const STYLES = {
  headerActionWrapper: "flex gap-3",
  resumeBtn: "group flex items-center gap-2 bg-transparent text-accent-primary border border-accent-primary/50 px-5 py-3 rounded-2xl font-bold hover:bg-accent-primary hover:text-white transition-all shadow-[0_0_20px_rgba(59,130,246,0.1)]",
  portfolioBtn: "group flex items-center gap-2 bg-transparent text-accent-secondary border border-accent-secondary/50 px-5 py-3 rounded-2xl font-bold hover:bg-accent-secondary hover:text-white transition-all shadow-[0_0_20px_rgba(168,85,247,0.1)]",
  tabsWrapper: "flex items-center gap-8 mb-8 border-b border-border-subtle px-2",
  tabBtnBase: "pb-4 text-sm font-bold tracking-widest uppercase transition-all relative",
  activeTabIndicator: "absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary",
  listWrapper: "relative min-h-[400px] card-standard p-8 md:p-12",
  emptyStateWrapper: "flex flex-col items-center justify-center h-64 text-center",
  emptyIconWrapper: "w-20 h-20 rounded-3xl bg-bg-card flex items-center justify-center text-text-muted mb-6"
};
