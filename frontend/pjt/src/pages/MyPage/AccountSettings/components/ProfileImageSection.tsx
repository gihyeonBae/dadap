import React from 'react';
import { Camera } from 'lucide-react';
import { STYLES } from '../AccountSettings.constants';

interface ProfileImageSectionProps {
  profileImage: string | null;
  isImageLoading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

export const ProfileImageSection: React.FC<ProfileImageSectionProps> = ({
  profileImage,
  isImageLoading,
  fileInputRef,
  onUpload,
  onRemove,
}) => (
  <div className="flex flex-col items-center sm:flex-row gap-8 pb-10 border-b border-border-subtle">
    <div 
      className="relative group cursor-pointer"
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="w-28 h-28 rounded-full border-2 border-border-subtle overflow-hidden bg-bg-surface relative">
        <img 
          src={profileImage || "/images/cat_mascot.png"} 
          alt="Profile" 
          className={`w-full h-full object-cover transition-opacity ${isImageLoading ? 'opacity-30' : 'opacity-100'}`} 
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/cat_mascot.png";
          }}
        />
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Camera className="text-white" size={24} />
      </div>
    </div>
    
    <div className="flex-1 text-center sm:text-left">
      <h3 className="text-lg font-bold text-text-main mb-1">Profile Photo</h3>
      <p className="text-sm text-text-muted mb-4">
        .png, .jpg 파일을 업로드해주세요. (최대 2MB)
      </p>
      <div className="flex gap-3 justify-center sm:justify-start">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={onUpload}
        />
        <button 
          type="button" 
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          disabled={isImageLoading}
          className="btn-secondary py-2 px-4 text-xs"
        >
          Upload New
        </button>
        <button 
          type="button" 
          onClick={onRemove}
          disabled={isImageLoading || !profileImage}
          className="btn-secondary py-2 px-4 text-xs border-border-subtle hover:border-red-500/50 hover:text-red-400"
        >
          Remove
        </button>
      </div>
    </div>
  </div>
);
