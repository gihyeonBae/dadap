// ★ 수정된 부분: PayloadAction 앞에 'type' 키워드 추가
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Slice의 state 타입 정의
interface AuthState {
  isLoggedIn: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  nickname: string | null;
  email: string | null;
  profileImage: string | null;
  bio: string | null;
  socialType: string | null;
}

// Hydration: localStorage에서 초기 상태 복구
const getValidProfileImage = (url: string | null | undefined) => {
  if (!url || url.includes('default.png')) return '/images/cat_mascot.png';
  return url;
};

const savedAccessToken = localStorage.getItem('accessToken');
const savedUserInfo = localStorage.getItem('userInfo');
let initialUserInfo = { 
  userId: null, 
  nickname: null, 
  email: null, 
  profileImage: '/images/cat_mascot.png' as string | null,
  bio: null,
  socialType: null as string | null
};

if (savedUserInfo) {
  try {
    const parsed = JSON.parse(savedUserInfo);
    initialUserInfo = {
      userId: parsed.userId?.toString() || null,
      nickname: parsed.nickname || null,
      email: parsed.email || null,
      profileImage: getValidProfileImage(parsed.profileImageUrl || parsed.profileImage),
      bio: parsed.bio || null,
      socialType: parsed.socialType || null,
    };
  } catch (e) {
    console.error('Failed to parse saved user info', e);
  }
}

// 초기 state
const initialState: AuthState = {
  isLoggedIn: !!savedAccessToken, // 토큰이 있으면 로그인 상태로 시작
  accessToken: savedAccessToken || null,
  refreshToken: null,
  ...initialUserInfo, // 고양이 프사 등 통합된 유저 정보 포함
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoginSuccess: (state, action: PayloadAction<{
      accessToken: string;
      refreshToken?: string;
      userId: string;
      nickname: string;
      email: string;
      profileImage?: string | null;
      socialType?: string | null;
    }>) => {
      state.isLoggedIn = true;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken || null;
      state.userId = action.payload.userId;
      state.nickname = action.payload.nickname;
      state.email = action.payload.email;
      state.profileImage = action.payload.profileImage || null;
      state.socialType = action.payload.socialType || null;
      try {
        // trigger myPage rehydrate listeners after login
        window.dispatchEvent(new CustomEvent('myPage:savedUpdated'));
        window.dispatchEvent(new CustomEvent('myPage:likedUpdated'));
      } catch {}
    },
    setLogout: (state) => {
      state.isLoggedIn = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.userId = null;
      state.nickname = null;
      state.email = null;
      state.profileImage = null;
      state.socialType = null;
      try {
        // notify UI that auth changed (components can reload scoped data)
        window.dispatchEvent(new CustomEvent('myPage:savedUpdated'));
        window.dispatchEvent(new CustomEvent('myPage:likedUpdated'));
      } catch {}
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    updateUserInfo: (state, action: PayloadAction<Partial<Pick<AuthState, 'nickname' | 'profileImage' | 'bio' | 'socialType'>>>) => {
      if (action.payload.nickname !== undefined) state.nickname = action.payload.nickname;
      if (action.payload.bio !== undefined) state.bio = action.payload.bio;
      if (action.payload.socialType !== undefined) state.socialType = action.payload.socialType;
      if (action.payload.profileImage !== undefined) {
        state.profileImage = getValidProfileImage(action.payload.profileImage);
      }
      
      // 로컬 스토리지 업데이트 동기화
      const savedUserInfo = localStorage.getItem('userInfo');
      if (savedUserInfo) {
        const parsed = JSON.parse(savedUserInfo);
        const updated = { 
          ...parsed, 
          nickname: action.payload.nickname !== undefined ? action.payload.nickname : parsed.nickname,
          bio: action.payload.bio !== undefined ? action.payload.bio : parsed.bio,
          socialType: action.payload.socialType !== undefined ? action.payload.socialType : parsed.socialType,
          profileImageUrl: action.payload.profileImage !== undefined ? action.payload.profileImage : (parsed.profileImageUrl || parsed.profileImage),
          profileImage: action.payload.profileImage !== undefined ? getValidProfileImage(action.payload.profileImage) : (parsed.profileImage || getValidProfileImage(parsed.profileImageUrl))
        };
        localStorage.setItem('userInfo', JSON.stringify(updated));
      }
    }
  },
});

export const { setLoginSuccess, setLogout, setAccessToken, updateUserInfo } = authSlice.actions;
export default authSlice.reducer;
