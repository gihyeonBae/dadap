export const SAVED_PROBLEMS_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

export const LIST_CONTAINER_VARIANTS = {
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
  paginationBtn: "w-10 h-10 rounded-md flex items-center justify-center border border-border-subtle bg-bg-card transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-surface",
  paginationActiveBtn: "w-10 h-10 rounded-md flex items-center justify-center border border-accent-primary bg-accent-primary text-white"
};
