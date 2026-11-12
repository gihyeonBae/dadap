export interface StudyPost {
  id: number;
  title: string;
  category: string;
  author: string;
  date: string;
  views: number;
  comments: number;
  likes: number;
  isLiked: boolean;
  content?: string;
  modelAnswer?: string;
  followUpQuestions?: FollowUpQuestion[];
}

export interface FollowUpQuestion {
  questionId: number;
  content: string;
  modelAnswer?: string;
}

export interface LocationState {
  title?: string;
  category?: string;
  page?: number;
}
