import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Trash2, ExternalLink } from 'lucide-react';
import { type PortfolioFile } from '../../api/services/portfolioService';

interface FileItemProps {
  file: PortfolioFile;
  onDelete?: (id: number) => void;
}

const FileItem: React.FC<FileItemProps> = ({ file, onDelete }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative flex items-center justify-between p-5 rounded-2xl border border-border-subtle bg-bg-card hover:bg-bg-surface transition-all"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
          file.type === 'RESUME' ? 'bg-accent-primary/10 text-accent-primary' : 'bg-accent-secondary/10 text-accent-secondary'
        }`}>
          <FileText size={24} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-text-sub text-[15px] font-medium group-hover:text-text-main transition-colors truncate max-w-[200px] md:max-w-md">
              {file.title}
            </h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
              file.type === 'RESUME' 
                ? 'border-accent-primary/30 text-accent-primary bg-accent-primary/5' 
                : 'border-accent-secondary/30 text-accent-secondary bg-accent-secondary/5'
            }`}>
              {file.type}
            </span>
          </div>
          <p className="text-text-muted text-xs mt-1">
            {file.createdAt.split('T')[0]}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => window.open(file.fileUrl, '_blank')}
          className="p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-text-main/5 transition-all"
          title="Preview"
        >
          <ExternalLink size={18} />
        </button>
        {onDelete && (
          <button 
            onClick={() => onDelete(file.id)}
            className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default FileItem;
