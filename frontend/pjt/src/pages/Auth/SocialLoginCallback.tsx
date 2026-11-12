import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authService } from '../../api/services/authService';
import { setLoginSuccess } from '../../redux/slices/authSlice';
import Loading from '../../components/Common/Loading';

const SocialLoginCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { provider } = useParams<{ provider: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const hasCalled = useRef(false); // 중복 호출 방지용

  useEffect(() => {
    const code = searchParams.get('code');

    if (code && provider) {
      if (!hasCalled.current) {
        hasCalled.current = true;
        handleSocialLogin(provider, code);
      }
    } else {
      console.error('No code or provider found');
      navigate('/login');
    }
  }, [provider, searchParams]);

  const handleSocialLogin = async (provider: string, code: string) => {
    try {
      let response;
      if (provider === 'github') {
        response = await authService.githubLogin(code);
      } else if (provider === 'google') {
        response = await authService.googleLogin(code);
      }

      if (response && response.data) {
        const { accessToken, userId, nickname, email, profileImageUrl, socialType } = response.data;

        // 통합된 authSlice의 setLoginSuccess 하나만 디스패치
        dispatch(setLoginSuccess({
          accessToken,
          userId: userId.toString(),
          nickname,
          email,
          profileImage: profileImageUrl,
          socialType: socialType
        }));

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('userInfo', JSON.stringify({
          userId,
          nickname,
          email,
          profileImage: profileImageUrl,
          socialType: socialType
        }));

        navigate('/');
      } else {
        alert('소셜 로그인에 실패했습니다.');
        navigate('/login');
      }
    } catch (error) {
      console.error('Social login error:', error);
      alert('로그인 처리 중 오류가 발생했습니다.');
      navigate('/login');
    }
  };

  return <Loading />;
};

export default SocialLoginCallback;
