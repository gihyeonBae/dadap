import { SavedProblem } from '../../../components/MyPage/SavedProblemItem';

export interface SavedProblemsProps {}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
