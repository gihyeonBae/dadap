import { Code, Database, Server, Wind } from 'lucide-react';

// Icon mapping for categories
export const CATEGORY_ICONS: { [key: string]: React.ElementType } = {
  DB: Database,
  BE: Server,
  OS: Server,
  NETWORK: Wind,
  FE: Code,
  DSA: Database,
  CS: Code, // Default for 'CS' or unknown
};

export const getCategoryDisplay = (category?: string) => {
  const cat = category?.toUpperCase();
  if (cat === 'DSA' || cat === 'DS' || cat === 'DATA STR') return 'DSA';
  return cat;
};

// Tailwind classes for Markdown components, adhering to the design system
export const MARKDOWN_STYLES = {
  h1: 'text-2xl text-text-main mt-8 mb-3 border-b border-border-default pb-2',
  h2: 'text-xl text-text-main mt-6 mb-2 border-b border-border-default pb-1',
  h3: 'text-lg text-text-main mt-5 mb-2',
  p: 'text-base text-text-main leading-relaxed my-4',
  ul: 'list-disc list-inside my-4 pl-4 space-y-2',
  ol: 'list-decimal list-inside my-4 pl-4 space-y-2',
  li: 'text-base text-text-main leading-relaxed',
  blockquote: 'border-l-4 border-accent-default bg-bg-surface-soft p-4 my-6 text-text-tertiary italic text-sm',
  codeBlockWrapper: 'my-6 rounded-lg overflow-hidden bg-bg-code-block border border-border-default',
  codeBlockHeader: 'px-4 py-2 bg-bg-code-block-header text-text-tertiary text-xs font-mono flex justify-between items-center',
  codeBlockCopyButton: 'text-xs font-semibold text-text-sub hover:text-text-main transition-colors',
  inlineCode: 'text-text-code bg-bg-code-inline rounded px-1.5 py-0.5 text-sm font-mono',
};

// Semantic Color Mapping (example, ensure these are defined in index.css)
export const SEMANTIC_COLORS = {
  bgMain: 'bg-bg-main',
  bgSurface: 'bg-bg-surface',
  textMain: 'text-text-main',
  textSub: 'text-text-sub',
  textTertiary: 'text-text-tertiary',
  borderDefault: 'border-border-default',
  // Add other semantic colors as needed
};

// Component Classes
export const COMPONENT_CLASSES = {
  glassUi: 'glass-ui',
  cardStandard: 'card-standard',
  btnPrimary: 'btn-primary',
  btnSecondary: 'btn-secondary',
  btnAccent: 'btn-accent',
  categoryTag: 'px-3 py-1 bg-accent-soft text-accent-default text-xs font-bold rounded-full border border-accent-border uppercase tracking-wider',
};

