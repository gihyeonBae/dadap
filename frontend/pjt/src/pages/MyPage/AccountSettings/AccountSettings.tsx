import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { motion } from 'framer-motion';

import MypageModal from '../../../components/MyPage/MypageModal';
import MyPageHeader from '../../../components/MyPage/MyPageHeader';

import { useAccountSettings } from './useAccountSettings';
import { STYLES, ACCOUNT_SETTINGS_VARIANTS } from './AccountSettings.constants';
import { ProfileImageSection } from './components/ProfileImageSection';
import { BasicInfoSection } from './components/BasicInfoSection';
import { SecuritySection } from './components/SecuritySection';

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const {
    formData,
    isLoading,
    isImageLoading,
    modal,
    profileImage,
    isSocialUser,
    socialType,
    fileInputRef,
    handleChange,
    handleImageUpload,
    handleImageRemove,
    handleSubmit,
    closeModal,
    handleConfirm
  } = useAccountSettings();

  return (
    <>
      <MypageModal
        open={modal.open}
        message={modal.message}
        onClose={closeModal}
        type={modal.type as any}
        title={modal.title}
        buttonText={modal.buttonText}
        onConfirm={handleConfirm}
        onCancel={closeModal}
        confirmType={modal.confirmType}
      />

      <motion.div 
        variants={ACCOUNT_SETTINGS_VARIANTS}
        initial="hidden"
        animate="visible"
        className="w-full"
      >
        <div className={STYLES.container}>
          <MyPageHeader
            title="Account Settings"
            description="계정 정보를 수정합니다"
            showDot={false}
          />

          <div className={STYLES.formWrapper}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-10">
              <ProfileImageSection 
                profileImage={profileImage}
                isImageLoading={isImageLoading}
                fileInputRef={fileInputRef}
                onUpload={handleImageUpload}
                onRemove={handleImageRemove}
              />

              <BasicInfoSection 
                formData={formData}
                onChange={handleChange}
              />

              <SecuritySection 
                isSocialUser={isSocialUser}
                socialType={socialType}
                formData={formData}
                onChange={handleChange}
              />

              <div className="flex justify-end gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => navigate('/mypage')}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="btn-accent px-8"
                >
                  {isLoading ? 'Saving...' : (
                    <>
                      <Save size={16} /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default AccountSettings;