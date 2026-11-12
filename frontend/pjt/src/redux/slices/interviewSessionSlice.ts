import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Question {
  id: number;
  text: string;
  keywords?: string[];
  hint?: string;
}

interface InterviewSessionState {
  interviewId: string | null;
  interviewType: 'DOCUMENT' | 'TECHNICAL' | null;
  mode: 'REAL' | 'PRACTICE' | null;
  videoBlob: Blob | null;
  answers: string[];
  questions: Question[];
  startTime: Date | null;
  endTime: Date | null;
}

const initialState: InterviewSessionState = {
  interviewId: null,
  interviewType: null,
  mode: null,
  videoBlob: null,
  answers: [],
  questions: [],
  startTime: null,
  endTime: null,
};

const interviewSessionSlice = createSlice({
  name: 'interviewSession',
  initialState,
  reducers: {
    startInterview: (state, action: PayloadAction<{
      interviewId: string;
      interviewType: 'DOCUMENT' | 'TECHNICAL';
      mode: 'REAL' | 'PRACTICE';
      questions: Question[];
    }>) => {
      state.interviewId = action.payload.interviewId;
      state.interviewType = action.payload.interviewType;
      state.mode = action.payload.mode;
      state.questions = action.payload.questions;
      state.answers = [];
      state.startTime = new Date();
      state.endTime = null;
    },
    addAnswer: (state, action: PayloadAction<string>) => {
      state.answers.push(action.payload);
    },
    setVideoBlob: (state, action: PayloadAction<Blob>) => {
      state.videoBlob = action.payload;
    },
    endInterview: (state) => {
      state.endTime = new Date();
    },
    resetInterview: () => {
      return initialState;
    },
    updateAnswers: (state, action: PayloadAction<string[]>) => {
      state.answers = action.payload;
    },
  },
});

export const {
  startInterview,
  addAnswer,
  setVideoBlob,
  endInterview,
  resetInterview,
  updateAnswers,
} = interviewSessionSlice.actions;

export default interviewSessionSlice.reducer;
