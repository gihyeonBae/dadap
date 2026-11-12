import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authService } from './api/services/authService';
import { setLoginSuccess } from './redux/slices/authSlice';

export type AuthMode = 'login' | 'signup' | 'passwordReset';

export interface AlertState {
  isOpen: boolean;
  title: string;
  description: string;
  type: 'success' | 'error' | 'info';
  onOk?: () => void;
}

export const useAuthForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: Code, 3: Success

  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    title: '',
    description: '',
    type: 'success',
  });

  const [values, setValues] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    resetCode: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    resetCode: '',
  });

  // 경로 변경 시 상태 초기화
  useEffect(() => {
    setApiError(null);
    setErrors({
      email: '',
      password: '',
      confirmPassword: '',
      nickname: '',
      resetCode: '',
    });
    setValues({
      email: '',
      password: '',
      confirmPassword: '',
      nickname: '',
      resetCode: '',
    });
    setResetStep(1);
  }, [location.pathname]);

  const closeAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
    if (alertState.onOk) alertState.onOk();
  }, [alertState]);

  const showAlert = useCallback((title: string, description: string, type: 'success' | 'error' | 'info' = 'success', onOk?: () => void) => {
    setAlertState({
      isOpen: true,
      title,
      description,
      type,
      onOk,
    });
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError(null);
  }, []);

  const validate = useCallback((mode: AuthMode) => {
    const newErrors = { email: '', password: '', confirmPassword: '', nickname: '', resetCode: '' };
    let isValid = true;

    if (!values.email) {
      newErrors.email = '이메일을 입력해주세요.';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요.';
      isValid = false;
    }

    if (mode === 'login' || mode === 'signup') {
      if (!values.password) {
        newErrors.password = '비밀번호를 입력해주세요.';
        isValid = false;
      } else if (mode === 'signup') {
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!passwordRegex.test(values.password)) {
          newErrors.password = '비밀번호는 8자 이상이며 영문, 숫자, 특수문자를 포함해야 합니다.';
          isValid = false;
        }
      }
    }

    if (mode === 'signup') {
      if (values.password !== values.confirmPassword) {
        newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
        isValid = false;
      }
      if (!values.nickname) {
        newErrors.nickname = '닉네임을 입력해주세요.';
        isValid = false;
      }
    }

    if (mode === 'passwordReset' && resetStep === 2) {
      if (!values.resetCode) {
        newErrors.resetCode = '인증 코드를 입력해주세요.';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [values, resetStep]);

  const handleSubmit = async (mode: 'login' | 'signup') => {
    if (!validate(mode)) return;
    setIsLoading(true);
    setApiError(null);
    try {
      if (mode === 'login') {
        const response = await authService.login({ email: values.email, password: values.password });
        const userData = response.data;
        
        localStorage.setItem('accessToken', userData.accessToken);
        localStorage.setItem('userInfo', JSON.stringify({ 
          userId: userData.userId,
          nickname: userData.nickname, 
          profileImageUrl: userData.profileImageUrl, 
          email: userData.email,
          socialType: userData.socialType
        }));

        dispatch(setLoginSuccess({ 
          accessToken: userData.accessToken, 
          refreshToken: '', 
          userId: userData.userId.toString(),
          nickname: userData.nickname,
          email: userData.email,
          profileImage: userData.profileImageUrl,
          socialType: userData.socialType
        }));
        
        navigate('/');
      } else {
        await authService.signup({ email: values.email, password: values.password, nickname: values.nickname });
        showAlert('회원가입 성공', '회원가입이 완료되었습니다.\n로그인 페이지로 이동합니다.', 'success', () => {
          navigate('/login');
        });
      }
    } catch (error: any) {
      setApiError(error.response?.data?.message || '요청에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordResetRequest = async () => {
    if (!validate('passwordReset')) return;
    setIsLoading(true);
    setApiError(null);
    try {
      await authService.requestPasswordReset(values.email);
      setResetStep(2);
    } catch (error: any) {
      setApiError(error.response?.data?.message || '비밀번호 재설정 요청에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordResetConfirm = async () => {
    if (!validate('passwordReset')) return;
    setIsLoading(true);
    setApiError(null);
    try {
      await authService.confirmPasswordReset(values.email, values.resetCode);
      setResetStep(3);
    } catch (error: any) {
      setApiError(error.response?.data?.message || '인증 코드 확인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'github' | 'google') => {
    const clientId = provider === 'github' ? import.meta.env.VITE_GITHUB_CLIENT_ID : import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = encodeURIComponent(window.location.origin + `/oauth/${provider}/redirect`);
    
    let authUrl = provider === 'github'
      ? `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`
      : `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile`;
    
    window.location.href = authUrl;
  };

  return {
    values,
    errors,
    isLoading,
    apiError,
    resetStep,
    alertState,
    setResetStep,
    handleChange,
    handleSubmit,
    handlePasswordResetRequest,
    handlePasswordResetConfirm,
    handleSocialLogin,
    closeAlert,
  };
};
