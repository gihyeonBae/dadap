import React from 'react';
import { motion } from 'framer-motion';
import AuthInput from './AuthInput';
import SocialLogin from './SocialLogin';

interface SignUpFormProps {
  values: any;
  errors: any;
  isLoading: boolean;
  apiError: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (mode: 'signup') => void;
  onToggleMode: () => void;
  onSocialLogin: (provider: 'github' | 'google') => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  values,
  errors,
  isLoading,
  apiError,
  onChange,
  onSubmit,
  onToggleMode,
  onSocialLogin,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit('signup');
  };

  return (
    <section className="space-y-6">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <AuthInput
          id="email"
          name="email"
          type="email"
          value={values.email}
          label="Email"
          error={errors.email}
          onChange={onChange}
          required
        />
        <AuthInput
          id="nickname"
          name="nickname"
          type="text"
          value={values.nickname}
          label="Nickname"
          error={errors.nickname}
          onChange={onChange}
          required
        />
        <AuthInput
          id="password"
          name="password"
          type="password"
          value={values.password}
          label="Password"
          error={errors.password}
          onChange={onChange}
          required
        />
        <AuthInput
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={values.confirmPassword}
          label="Confirm Password"
          error={errors.confirmPassword}
          onChange={onChange}
          required
        />

        {apiError && (
          <p role="alert" className="text-sm text-center text-red-400 bg-red-900/50 p-3 rounded-lg">
            {apiError}
          </p>
        )}
        
        <button 
          type="submit" 
          className="w-full btn-accent"
          disabled={isLoading}
        >
          {isLoading ? '...' : 'CREATE ACCOUNT'}
        </button>
      </form>

      <SocialLogin onSocialLogin={onSocialLogin} />

      <footer className="text-center text-sm text-text-sub">
        Already have an account?
        <button 
          type="button"
          onClick={onToggleMode} 
          className="font-bold text-accent-primary hover:opacity-80 ml-1 transition-colors"
        >
          Login
        </button>
      </footer>
    </section>
  );
};

export default SignUpForm;
