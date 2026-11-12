import React from 'react';
import { Trash2 } from 'lucide-react';
import type { LikedPostItemProps } from '../LikedPosts.types';

export const LikedPostItem: React.FC<LikedPostItemProps> = ({ item, onRemove, onView }) => (
  <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] flex justify-between items-center transition-all hover:border-accent-primary/30">
    <div className="flex-1 pr-6">
      <h3 className="text-lg md:text-xl font-bold text-text-main line-clamp-2">{item.title}</h3>
      <div className="text-sm text-text-muted mt-2">{item.author} {item.date}</div>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={() => onRemove(item.id, item.type)}
        title="삭제"
        aria-label="삭제"
        className="w-9 h-9 rounded-md flex items-center justify-center border border-white/10 bg-white/5 text-text-sub hover:bg-rose-600/10 hover:text-rose-400 hover:border-rose-400 transition-colors"
      >
        <Trash2 size={16} />
      </button>
      <button 
        onClick={() => onView(item.id, item.type)} 
        className="px-3 py-2 rounded bg-zinc-700 hover:bg-zinc-600 text-white"
      >
        View
      </button>
    </div>
  </div>
);
