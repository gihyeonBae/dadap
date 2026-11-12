export const LIKED_POSTS_VARIANTS = {
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
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } 
  }
};

export const PAGE_SIZE = 7;

export const STYLES = {
  container: "p-8 md:p-12 card-standard",
  itemWrapper: "p-6 rounded-2xl border border-border-subtle bg-bg-card flex justify-between items-center transition-all hover:border-accent-primary/30",
  title: "text-lg md:text-xl font-bold text-text-main line-clamp-2",
  meta: "text-sm text-text-muted mt-2",
  unlikeBtn: "w-9 h-9 rounded-md flex items-center justify-center border border-border-subtle bg-bg-surface text-text-sub hover:bg-rose-600/10 hover:text-rose-400 hover:border-rose-400 transition-colors",
  viewBtn: "btn-primary py-2 px-4 text-xs",
  paginationBtn: "w-10 h-10 rounded-md flex items-center justify-center border border-border-subtle bg-bg-card transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-surface",
  paginationActiveBtn: "w-10 h-10 rounded-md flex items-center justify-center border border-accent-primary bg-accent-primary text-white"
};
