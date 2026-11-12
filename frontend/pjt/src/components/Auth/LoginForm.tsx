import React from 'react';
import { motion } from 'framer-motion';
import AuthInput from './AuthInput';
import SocialLogin from './SocialLogin';

interface LoginFormProps {
  values: any;
  errors: any;
  isLoading: boolean;
  apiError: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (mode: 'login') => void;
  onToggleMode: () => void;
  onPasswordReset: () => void;
  onSocialLogin: (provider: 'github' | 'google') => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  values,
  errors,
  isLoading,
  apiError,
  onChange,
  onSubmit,
  onToggleMode,
  onPasswordReset,
  onSocialLogin,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit('login');
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
          id="password"
          name="password"
          type="password"
          value={values.password}
          label="Password"
          error={errors.password}
          onChange={onChange}
          required
        />

        {apiError && (
          <p role="alert" className="text-sm text-center text-red-400 bg-red-900/50 p-3 rounded-lg">
            {apiError}
          </p>
        )}
        
        <div className="flex justify-end">
          <button 
            type="button" 
            onClick={onPasswordReset}
            className="text-xs text-text-muted hover:text-accent-primary transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <button 
          type="submit" 
          className="w-full btn-accent"
          disabled={isLoading}
        >
          {isLoading ? '...' : 'LOGIN'}
        </button>
      </form>

      <SocialLogin onSocialLogin={onSocialLogin} />

      <footer className="text-center text-sm text-text-sub">
        Don't have an account?
        <button 
          type="button"
          onClick={onToggleMode} 
          className="font-bold text-accent-primary hover:opacity-80 ml-1 transition-colors"
        >
          Sign Up
        </button>
      </footer>
    </section>
  );
};

export default LoginForm;
