import { BoardListItem } from '../../../api/myBoardsService';

export interface MyStoriesProps {}

export interface StoryItemProps {
  post: BoardListItem;
  onClick: (postId: number) => void;
}
