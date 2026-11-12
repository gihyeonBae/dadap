import React from 'react';
import { User, Mail } from 'lucide-react';
import { InputField } from './InputField';
import { STYLES } from '../AccountSettings.constants';

interface BasicInfoSectionProps {
  formData: {
    nickname: string;
    email: string;
    bio: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ formData, onChange }) => {
  const nicknameLength = formData.nickname.length;
  const nicknameRegex = /^[A-Za-z0-9가-힣]+$/;
  const jamoOnlyRegex = /^[\u3131-\u3163]+$/;
  const hasNickname = nicknameLength > 0;
  const isPatternValid = !hasNickname || (nicknameRegex.test(formData.nickname) && !jamoOnlyRegex.test(formData.nickname));
  const isLengthValid = nicknameLength >= 2 && nicknameLength <= 20;
  const isNicknameValid = isPatternValid && isLengthValid;

  return (
    <div className="space-y-6">
      <h3 className={STYLES.sectionTitle}>Basic Information</h3>
      
      <div className="grid grid-cols-1 gap-2">
        <InputField 
          label="Nickname" 
          name="nickname" 
          icon={<User size={16} />} 
          value={formData.nickname} 
          onChange={onChange}
          maxLength={20}
        />
        <div className="flex items-center gap-2 justify-start">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              !isNicknameValid
                ? 'bg-red-500/15 text-red-500 border-red-500/30'
                : 'bg-accent-primary/15 text-accent-primary border-accent-primary/30'
            }`}
          >
            {nicknameLength}/20
          </span>
          {!isNicknameValid && (
            <span className="text-[10px] text-red-500 font-semibold">사용 불가</span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className={STYLES.label}>Bio</label>
        <textarea 
          name="bio"
          rows={3}
          value={formData.bio}
          onChange={onChange}
          className={STYLES.textarea}
        />
      </div>

      <InputField 
        label="Email Address" 
        name="email" 
        icon={<Mail size={16} />} 
        value={formData.email} 
        onChange={onChange}
        disabled 
        helperText="이메일은 변경할 수 없습니다."
      />
    </div>
  );
};
