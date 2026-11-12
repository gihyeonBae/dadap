import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Loader2 } from 'lucide-react';
import FileItem from '../../../../components/MyPage/FileItem';
import type { PortfolioListProps } from '../MyPortfolio.types';
import { STYLES, LIST_CONTAINER_VARIANTS } from '../MyPortfolio.constants';

export const PortfolioList: React.FC<PortfolioListProps> = ({ 
  files, 
  isLoading, 
  activeTab, 
  onDelete 
}) => {
  return (
    <motion.div 
      {...LIST_CONTAINER_VARIANTS}
      className={STYLES.listWrapper}
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="animate-spin text-accent-primary" size={40} />
          <p className="text-text-muted animate-pulse">Loading documents...</p>
        </div>
      ) : files.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {files.map((file) => (
              <FileItem 
                key={file.id} 
                file={file} 
                onDelete={onDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className={STYLES.emptyStateWrapper}>
          <div className={STYLES.emptyIconWrapper}>
            <Upload size={40} />
          </div>
          <h3 className="text-xl font-bold text-text-sub mb-2">No {activeTab === 'RESUME' ? 'resumes' : 'portfolios'}</h3>
          <p className="text-text-muted max-w-xs mx-auto">
            Start by adding your first {activeTab === 'RESUME' ? 'resume' : 'portfolio'}.
          </p>
        </div>
      )}
    </motion.div>
  );
};
