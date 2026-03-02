export interface AddToWishlistDto {
  userId: string;
  username: string;
  bookId: string;
}

export interface RemoveFromWishlistDto {
  userId: string;
  bookId: string;
}

export interface CreateReadingListDto {
  userId: string;
  username: string;
  name: string;
  description?: string;
}

export interface AddToReadingListDto {
  userId: string;
  readingListId: string;
  bookId: string;
}

export interface UpdateReadingListItemDto {
  status?: 'want_to_read' | 'reading' | 'finished';
  rating?: number;
  notes?: string;
}

export interface UpdateReadingListDto {
  name?: string;
  description?: string;
  isPublic?: boolean;
}
