import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../redux/store';
import { updateUserInfo } from '../../../redux/slices/authSlice';
import { mypageService } from '../../../api/services/mypageService';
import type { AccountSettingsFormData, ModalState } from './AccountSettings.types';
import { INITIAL_FORM_DATA } from './AccountSettings.constants';

export const useAccountSettings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { nickname, email, profileImage, socialType } = useSelector((state: RootState) => state.auth);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [modal, setModal] = useState<ModalState>({ 
    open: false, 
    message: '', 
    type: 'success' 
  });

  const [formData, setFormData] = useState<AccountSettingsFormData>(INITIAL_FORM_DATA);

  const isSocialUser = !!socialType;
  const isNicknameValid = (value: string) => {
    if (value.length < 2 || value.length > 20) return false;
    const allowedRegex = /^[A-Za-z0-9가-힣]+$/;
    const jamoOnlyRegex = /^[\u3131-\u3163]+$/;
    if (!allowedRegex.test(value)) return false;
    if (jamoOnlyRegex.test(value)) return false;
    return true;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await mypageService.getUserMe();
        if (response.status === 200) {
          const { nickname, email, bio, socialType: serverSocialType, profileImageUrl } = response.data;
          setFormData(prev => ({
            ...prev,
            nickname: nickname || '',
            email: email || '',
            bio: bio || '',
          }));
          dispatch(updateUserInfo({ 
            nickname, 
            profileImage: profileImageUrl,
            socialType: serverSocialType 
          }));
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        if (nickname || email) {
          setFormData(prev => ({
            ...prev,
            nickname: nickname || '',
            email: email || '',
          }));
        }
      }
    };

    fetchUserData();
  }, [dispatch, nickname, email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'nickname') {
      const trimmed = value.slice(0, 20);
      setFormData(prev => ({ ...prev, [name]: trimmed }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImageLoading(true);
    try {
      const response = await mypageService.uploadProfileImage(file);
      if (response.status === 200) {
        const newImageUrl = `${response.data.profileImageUrl}?t=${new Date().getTime()}`;
        dispatch(updateUserInfo({ profileImage: newImageUrl }));
        setModal({
          open: true,
          message: '프로필 이미지가 변경되었습니다.',
          type: 'success',
        });
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      setModal({
        open: true,
        message: '이미지 업로드에 실패했습니다.',
        type: 'error',
      });
    } finally {
      setIsImageLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const confirmRemoveProfileImage = async () => {
    setIsImageLoading(true);
    try {
      const response = await mypageService.deleteProfileImage();
      if (response.status === 200) {
        dispatch(updateUserInfo({ profileImage: null }));
        setModal({
          open: true,
          message: '프로필 이미지가 삭제되었습니다.',
          type: 'success',
        });
      }
    } catch (error) {
      console.error("Failed to delete image:", error);
      setModal({
        open: true,
        message: '이미지 삭제에 실패했습니다.',
        type: 'error',
      });
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleImageRemove = () => {
    if (!profileImage) return;
    setModal({
      open: true,
      message: '프로필 이미지를 삭제하시겠습니까?',
      type: 'confirm',
      title: '경고',
      confirmType: 'error',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!isNicknameValid(formData.nickname)) {
        setModal({
          open: true,
          message: '사용할 수 없는 닉네임입니다.',
          type: 'error',
        });
        setIsLoading(false);
        return;
      }

      const profileResponse = await mypageService.updateProfile({
        nickname: formData.nickname,
        bio: formData.bio
      });

      if (profileResponse.status === 200) {
        dispatch(updateUserInfo({ 
          nickname: formData.nickname,
          bio: formData.bio
        }));
      }

      if (formData.currentPassword && formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setModal({
            open: true,
            message: '새 비밀번호가 일치하지 않습니다.',
            type: 'error',
          });
          setIsLoading(false);
          return;
        }

        const passwordResponse = await mypageService.changePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        });

        if (passwordResponse.status !== 200) {
          throw new Error("비밀번호 변경에 실패했습니다.");
        }
      }

      setModal({
        open: true,
        message: '정보가 성공적으로 수정되었습니다.',
        type: 'success',
      });
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (error: any) {
      console.error("Update failed:", error);
      setModal({
        open: true,
        message: error.response?.data?.message || '정보 수정 중 오류가 발생했습니다.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, open: false }));
    if (modal.type === 'success' && modal.message === '정보가 성공적으로 수정되었습니다.') {
      navigate('/mypage');
    }
  };

  const handleConfirm = () => {
    setModal(prev => ({ ...prev, open: false }));
    if (modal.type === 'confirm') {
      setTimeout(() => confirmRemoveProfileImage(), 100);
    }
  };

  return {
    formData,
    isLoading,
    isImageLoading,
    modal,
    nickname,
    email,
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
  };
};
