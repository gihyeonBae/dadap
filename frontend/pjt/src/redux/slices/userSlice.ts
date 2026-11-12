import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  userId: string | null;
  nickname: string | null;
  email: string | null;
  profileImage: string | null;
}

const initialState: UserState = {
  userId: null,
  nickname: null,
  email: null,
  profileImage: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<{
      userId: string;
      nickname: string;
      email: string;
      profileImage?: string;
    }>) => {
      state.userId = action.payload.userId;
      state.nickname = action.payload.nickname;
      state.email = action.payload.email;
      state.profileImage = action.payload.profileImage || null;
    },
    updateNickname: (state, action: PayloadAction<string>) => {
      state.nickname = action.payload;
    },
    updateProfileImage: (state, action: PayloadAction<string>) => {
      state.profileImage = action.payload;
    },
    clearUserInfo: (state) => {
      state.userId = null;
      state.nickname = null;
      state.email = null;
      state.profileImage = null;
    },
  },
});

export const { setUserInfo, updateNickname, updateProfileImage, clearUserInfo } = userSlice.actions;
export default userSlice.reducer;
