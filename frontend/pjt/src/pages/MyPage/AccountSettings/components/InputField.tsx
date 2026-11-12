import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { InputFieldProps } from '../AccountSettings.types';
import { STYLES } from '../AccountSettings.constants';

export const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  icon, 
  helperText, 
  statusText,
  statusTone = 'info',
  className = '', 
  ...props 
}) => (
  <div className={STYLES.inputWrapper}>
    <label className={STYLES.label}>{label}</label>
    <div className="relative group">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors pointer-events-none">
          {icon}
        </div>
      )}
      {statusText && (
        <div
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold ${
            statusTone === 'error' ? 'text-red-500' : 'text-text-muted'
          }`}
        >
          {statusText}
        </div>
      )}
      <input 
        className={`${STYLES.inputBase} ${icon ? 'pl-11' : 'pl-4'} ${statusText ? 'pr-16' : 'pr-4'} ${className}`}
        {...props}
      />
    </div>
    {helperText && (
      <p className={STYLES.helperText}>
        <AlertCircle size={10} /> {helperText}
      </p>
    )}
  </div>
);
