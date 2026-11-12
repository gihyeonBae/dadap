import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface InterviewUIState {
  currentQuestion: number;
  analysisRange: number;
}

const initialState: InterviewUIState = {
  currentQuestion: 1,
  analysisRange: 85,
};

const interviewUISlice = createSlice({
  name: 'interviewUI',
  initialState,
  reducers: {
    setCurrentQuestion: (state, action: PayloadAction<number>) => {
      state.currentQuestion = action.payload;
    },
    setAnalysisRange: (state, action: PayloadAction<number>) => {
      state.analysisRange = action.payload;
    },
    resetInterviewUI: () => {
      return initialState;
    },
  },
});

export const { setCurrentQuestion, setAnalysisRange, resetInterviewUI } = interviewUISlice.actions;
export default interviewUISlice.reducer;
