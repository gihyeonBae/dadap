export const ACCOUNT_SETTINGS_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const INITIAL_FORM_DATA = {
  nickname: '',
  email: '',
  bio: '한줄로 나를 소개해주세요.',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
};

export const STYLES = {
  container: "relative z-10 w-full max-w-6xl mx-auto",
  formWrapper: "p-8 md:p-10 card-standard",
  sectionWrapper: "space-y-6 pb-10 border-b border-border-subtle",
  sectionTitle: "text-sm font-bold text-accent-secondary uppercase tracking-widest mb-4",
  inputWrapper: "flex flex-col gap-2 w-full",
  label: "text-xs font-bold text-text-muted uppercase tracking-wider ml-1",
  inputBase: "w-full bg-bg-card border border-border-subtle rounded-xl p-3 text-sm text-text-main focus:outline-none focus:border-accent-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all placeholder:text-text-muted",
  textarea: "w-full bg-bg-card border border-border-subtle rounded-xl p-4 text-sm text-text-main focus:outline-none focus:border-accent-primary transition-all resize-none placeholder:text-text-muted",
  helperText: "text-[10px] text-text-muted flex items-center gap-1 ml-1"
};
