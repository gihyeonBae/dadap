import React from 'react';
import { motion } from 'framer-motion';
import AuthInput from './AuthInput';

interface PasswordResetFormProps {
  step: number;
  values: any;
  errors: any;
  isLoading: boolean;
  apiError: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRequestReset: () => void;
  onConfirmReset: () => void;
  onBackToLogin: () => void;
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  step,
  values,
  errors,
  isLoading,
  apiError,
  onChange,
  onRequestReset,
  onConfirmReset,
  onBackToLogin,
}) => {
  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    onRequestReset();
  };

  const handleConfirmReset = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmReset();
  };

  return (
    <section className="space-y-6">
      <header className="text-center space-y-2">
        <h3 className="text-white">Reset Password</h3>
        <p className="text-sm text-text-sub">
          {step === 1 && "Enter your email to receive a reset code."}
          {step === 2 && "Enter the verification code sent to your email."}
          {step === 3 && "Password reset successful!"}
        </p>
      </header>

      <div className="space-y-4">
        {step === 1 && (
          <form onSubmit={handleRequestReset} className="space-y-4">
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
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full btn-accent"
            >
              {isLoading ? '...' : 'SEND RESET CODE'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleConfirmReset} className="space-y-4">
            <AuthInput
              id="resetCode"
              name="resetCode"
              type="text"
              value={values.resetCode}
              label="Verification Code"
              error={errors.resetCode}
              onChange={onChange}
              required
            />
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full btn-accent"
            >
              {isLoading ? '...' : 'VERIFY CODE'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-center text-green-400 font-medium" role="status">
              A temporary password has been sent to your email.
            </p>
            <button 
              type="button"
              onClick={onBackToLogin}
              className="w-full btn-secondary"
            >
              BACK TO LOGIN
            </button>
          </div>
        )}

        {apiError && (
          <p role="alert" className="text-sm text-center text-red-400 bg-red-900/50 p-3 rounded-lg">
            {apiError}
          </p>
        )}
        
        {step !== 3 && (
          <button 
            type="button"
            onClick={onBackToLogin}
            className="w-full text-sm text-text-muted hover:text-text-main transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </section>
  );
};

export default PasswordResetForm;
