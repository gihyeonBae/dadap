import React from 'react';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { InputField } from './InputField';
import { STYLES } from '../AccountSettings.constants';

interface SecuritySectionProps {
  isSocialUser: boolean;
  socialType: string | null;
  formData: {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({ 
  isSocialUser, 
  socialType, 
  formData, 
  onChange 
}) => (
  <div className="space-y-6 pt-6 border-t border-border-subtle">
    <h3 className={STYLES.sectionTitle}>Security</h3>
    
    {isSocialUser ? (
      <div className="p-4 rounded-xl bg-accent-primary/5 border border-accent-primary/10 flex items-start gap-3">
        <AlertCircle size={18} className="text-accent-primary mt-0.5" />
        <div>
          <p className="text-sm text-text-main font-medium">소셜 계정 로그인</p>
          <p className="text-xs text-text-muted mt-1">
            {socialType} 계정으로 로그인되었습니다. 
            비밀번호 관리 및 보안 설정은 해당 소셜 서비스에서 관리하실 수 있습니다.
          </p>
        </div>
      </div>
    ) : (
      <div className="space-y-4">
        <InputField 
          label="Current Password" 
          name="currentPassword" 
          type="password"
          icon={<Lock size={16} />} 
          value={formData.currentPassword} 
          onChange={onChange} 
          placeholder="현재 비밀번호를 입력하세요"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField 
            label="New Password" 
            name="newPassword" 
            type="password"
            icon={<Lock size={16} />} 
            value={formData.newPassword} 
            onChange={onChange} 
            placeholder="새 비밀번호"
          />
          <InputField 
            label="Confirm Password" 
            name="confirmPassword" 
            type="password"
            icon={<CheckCircle2 size={16} />} 
            value={formData.confirmPassword} 
            onChange={onChange} 
            placeholder="새 비밀번호 확인"
          />
        </div>
      </div>
    )}
  </div>
);
