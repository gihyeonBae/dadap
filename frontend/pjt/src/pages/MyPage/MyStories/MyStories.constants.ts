export const MY_STORIES_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

export const LIST_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } 
  }
};

export const STYLES = {
  container: "p-6 card-standard",
  listWrapper: "flex flex-col divide-y divide-border-subtle",
  itemBtn: "w-full text-left py-6 px-4 hover:bg-bg-surface transition-all flex items-center justify-between group rounded-xl",
  title: "text-lg font-bold text-text-main group-hover:text-accent-primary transition-colors",
  date: "text-text-muted text-sm mt-1",
  stats: "text-text-muted text-sm flex items-center gap-4"
};
