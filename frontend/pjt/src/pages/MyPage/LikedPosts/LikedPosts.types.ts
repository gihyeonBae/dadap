export interface LikedPost {
  id: number;
  type: 'board' | 'study';
  title: string;
  author?: string;
  date?: string;
  likes?: number;
}

export interface LikedPostItemProps {
  item: LikedPost;
  onRemove: (id: number, type: string) => void;
  onView: (id: number, type: string) => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
