import React from 'react';

export interface AccountSettingsFormData {
  nickname: string;
  email: string;
  bio: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface ModalState {
  open: boolean;
  message: string;
  type?: 'success' | 'error' | 'info' | 'confirm';
  title?: string;
  buttonText?: string;
  confirmType?: 'error' | 'success' | 'info';
}

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  helperText?: string;
  statusText?: string;
  statusTone?: 'error' | 'info';
}

export interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  icon?: React.ReactNode;
  options: string[];
}
