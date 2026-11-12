import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mypageService } from '../../api/services/mypageService';
import type { MyPageData } from '../../types/api/mypage';

interface MyPageState {
  data: MyPageData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: MyPageState = {
  data: null,
  isLoading: false,
  error: null,
};

// 마이페이지 데이터 패칭 비동기 액션
export const fetchMyPageData = createAsyncThunk(
  'mypage/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await mypageService.getMyPageData();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '데이터를 불러오지 못했습니다.');
    }
  }
);

const mypageSlice = createSlice({
  name: 'mypage',
  initialState,
  reducers: {
    resetMyPageState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyPageData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyPageData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchMyPageData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetMyPageState } = mypageSlice.actions;
export default mypageSlice.reducer;
