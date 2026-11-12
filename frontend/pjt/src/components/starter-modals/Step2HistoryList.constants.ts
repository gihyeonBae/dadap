export const HISTORY_LIST_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

export const UPLOAD_FORM_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

export const STYLES = {
  backButton: "flex items-center gap-2 text-text-muted hover:text-text-main transition-colors group px-8 pt-7",
  header: "text-xl font-bold text-text-main mb-6 tracking-tight text-center",
  listContainer: "flex flex-col gap-2.5 mb-8 min-h-[150px] max-h-[250px] overflow-y-auto pr-2 custom-scrollbar",
  loadingText: "text-text-muted text-sm text-center",
  listItemBase: "flex items-center justify-between p-4 rounded-xl border transition-all",
  listItemActive: "bg-accent-primary/10 border-accent-primary",
  listItemInactive: "bg-bg-card border-border-subtle hover:border-border-main",
  fileIconActive: "text-accent-primary",
  fileIconInactive: "text-text-muted",
  fileNameActive: "text-text-main",
  fileNameInactive: "text-text-muted",
  fileDate: "text-xs text-text-muted",
  checkIconWrapper: "bg-accent-primary rounded-full p-0.5",
  checkIcon: "w-3.5 h-3.5 text-white",
  emptyStateWrapper: "flex flex-col items-center justify-center h-40 text-center bg-bg-card rounded-2xl border border-dashed border-border-subtle mb-8",
  emptyStateText: "text-text-muted text-sm",
  confirmButtonActive: "w-full btn-primary",
  confirmButtonInactive: "w-full btn-secondary disabled:opacity-40 disabled:cursor-not-allowed",
  uploadLabel: "flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border-subtle rounded-[1.5rem] bg-bg-card hover:bg-bg-surface hover:border-accent-primary/40 transition-all cursor-pointer mb-8 group",
  uploadIcon: "w-10 h-10 text-text-muted group-hover:text-accent-primary mb-3 transition-colors",
  uploadFileName: "text-sm text-text-sub font-medium px-6 text-center break-all",
  errorAlert: "flex items-center gap-2 text-status-error bg-status-error/10 p-3.5 rounded-xl mb-6",
  errorText: "text-xs font-medium",
  loaderIcon: "w-7 h-7 text-accent-primary animate-spin",
  loadingMessage: "text-text-muted text-sm text-center",
  aiAnalyzingIcon: "w-20 h-20 text-accent-primary animate-spin opacity-20",
  sparklesIcon: "w-10 h-10 text-accent-secondary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse",
  aiAnalyzingTitle: "text-xl font-bold text-text-main mb-2 tracking-tight text-center",
  aiAnalyzingMessage: "text-text-sub text-sm font-medium animate-pulse text-center",
  analysisDoneIcon: "w-20 h-20 text-status-success mb-6",
  analysisDoneTitle: "text-xl font-bold text-text-main mb-2 tracking-tight text-center",
  analysisDoneMessage: "text-text-sub text-sm font-medium text-center",
};