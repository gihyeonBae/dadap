import React from 'react';
import { ChevronRight } from 'lucide-react';

interface ContentCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ title, description, onClick }) => (
  <button 
    onClick={onClick}
    className="card-standard group relative w-full text-left p-10 transition-all duration-300 overflow-hidden border-l-4 border-border-subtle hover:border-accent-primary bg-bg-card shadow-lg"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 to-transparent pointer-events-none group-hover:from-accent-primary/10 transition-all" />
    <div className="relative z-10 flex justify-between items-center">
      <div>
        <h3 className="uppercase mb-3 transition-colors text-text-main group-hover:text-accent-primary">
          {title}
        </h3>
        <p className="text-text-sub font-medium group-hover:text-text-main transition-colors max-w-lg leading-relaxed">
          {description}
        </p>
      </div>
      <div className="w-14 h-14 rounded-full border border-border-main flex items-center justify-center bg-bg-main/40 group-hover:bg-accent-primary group-hover:text-white group-hover:border-accent-primary transition-all shadow-xl group-hover:scale-110">
        <ChevronRight size={24} />
      </div>
    </div>
  </button>
);

export default ContentCard;
