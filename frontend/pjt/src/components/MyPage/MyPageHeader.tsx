import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MyPageHeaderProps {
  title: string;
  description?: string;
  backPath?: string;
  backLabel?: string;
  children?: React.ReactNode;
  showDot?: boolean;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } }
};

const MyPageHeader: React.FC<MyPageHeaderProps> = ({ 
  title, 
  description, 
  backPath = '/mypage', 
  backLabel = 'Back to My Page',
  children,
  showDot = true
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8 mb-12">
      <motion.button 
        variants={itemVariants}
        onClick={() => navigate(backPath)}
        className="flex items-center gap-3 text-text-muted hover:text-text-main transition-all w-fit group px-4 py-2 rounded-full border border-border-subtle bg-bg-card backdrop-blur-sm"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-bold tracking-widest uppercase">{backLabel}</span>
      </motion.button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <motion.div variants={itemVariants}>
          <h3 className="text-text-main">
            {title}{showDot && <span className="text-accent-primary">.</span>}
          </h3>
          {description && (
            <p className="text-text-sub font-medium text-lg">
              {description}
            </p>
          )}
        </motion.div>
        
        <motion.div variants={itemVariants}>
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default MyPageHeader;
