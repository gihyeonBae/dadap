import React from 'react';
import { motion } from 'framer-motion';
import { Database, Code, Layers, Bookmark, ArrowRight, Tag, Trash2 } from 'lucide-react';

export interface SavedProblem {
  id: number;
  category: string;
  subCategory: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  savedDate: string;
  tags: string[];
}

interface SavedProblemItemProps {
  problem: SavedProblem;
  onSolve: (id: number) => void;
  onDelete: (id: number, e: React.MouseEvent) => void;
}

const SavedProblemItem: React.FC<SavedProblemItemProps> = ({ problem, onSolve, onDelete }) => {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'Medium': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'Hard': return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      default: return 'text-zinc-400 border-zinc-500/30 bg-zinc-500/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative"
    >
      <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] flex justify-between items-center">
        <div className="flex-1 pr-6">
          <h3 className="text-lg md:text-xl font-bold text-white line-clamp-2">{problem.title}</h3>
          <div className="text-sm text-zinc-500 mt-2">{problem.category} {problem.savedDate}</div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => onDelete(problem.id, e)}
            title="Remove"
            className="w-9 h-9 rounded-md flex items-center justify-center border border-white/10 bg-white/5 text-zinc-300 hover:bg-rose-600/10 hover:text-rose-400 hover:border-rose-400 transition-colors"
          >
            <Trash2 size={16} />
          </button>
          
          <button
            onClick={() => onSolve(problem.id)}
            className="px-3 py-2 rounded bg-zinc-700 hover:bg-zinc-600 text-white"
          >
            View
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SavedProblemItem;
