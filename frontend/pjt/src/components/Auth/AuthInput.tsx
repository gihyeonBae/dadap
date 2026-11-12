import React from 'react';

interface AuthInputProps {
  id: string;
  name: string;
  type: string;
  value: string;
  label: string;
  placeholder?: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const AuthInput: React.FC<AuthInputProps> = ({
  id,
  name,
  type,
  value,
  label,
  placeholder = '',
  error,
  onChange,
  required = false,
}) => {
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col space-y-1.5">
      <label 
        htmlFor={id} 
        className="text-sm font-semibold text-text-sub ml-1"
      >
        {label}
      </label>
      <input 
        type={type} 
        id={id} 
        name={name} 
        value={value} 
        onChange={onChange} 
        required={required} 
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className="w-full px-4 py-3 bg-bg-card border border-border-subtle rounded-lg text-text-main focus:outline-none focus:border-accent-primary transition-all"
        placeholder={placeholder || label}
      />
      {error && (
        <p 
          id={errorId}
          className="text-xs text-red-400 mt-1 ml-1 font-medium"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default AuthInput;
