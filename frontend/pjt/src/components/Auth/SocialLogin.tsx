import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { BsGithub } from 'react-icons/bs';
import { motion } from 'framer-motion';

interface SocialLoginProps {
  onSocialLogin: (provider: 'github' | 'google') => void;
}

const SocialLogin: React.FC<SocialLoginProps> = ({ onSocialLogin }) => {
  return (
    <section aria-label="Social Login">
      <div className="flex items-center my-4" role="separator">
        <div className="flex-grow border-t border-border-subtle" aria-hidden="true"></div>
        <span className="flex-shrink mx-4 text-xs text-text-muted uppercase">Or</span>
        <div className="flex-grow border-t border-border-subtle" aria-hidden="true"></div>
      </div>
      <div className="flex justify-center gap-4">
        <button 
          type="button"
          onClick={() => onSocialLogin('google')} 
          aria-label="Login with Google"
          className="w-12 h-12 flex items-center justify-center bg-bg-card border border-border-subtle rounded-full hover:bg-bg-surface transition-colors transform hover:scale-110"
        >
          <FcGoogle size={24} />
        </button>
        <button 
          type="button"
          onClick={() => onSocialLogin('github')} 
          aria-label="Login with GitHub"
          className="w-12 h-12 flex items-center justify-center bg-bg-card border border-border-subtle rounded-full text-text-main hover:bg-bg-surface transition-colors transform hover:scale-110"
        >
          <BsGithub size={24} />
        </button>
      </div>
    </section>
  );
};

export default SocialLogin;
