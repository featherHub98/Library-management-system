export interface IWishlistItem {
  bookId: string;
  addedAt: Date;
}

export interface IWishlist {
  id: string;
  userId: string;
  username: string;
  items: IWishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IReadingListItem {
  bookId: string;
  status: 'want_to_read' | 'reading' | 'finished';
  rating?: number;
  notes?: string;
  addedAt: Date;
  finishedAt?: Date;
}

export interface IReadingList {
  id: string;
  userId: string;
  username: string;
  name: string;
  description?: string;
  items: IReadingListItem[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReadingListResponse {
  id: string;
  userId: string;
  username: string;
  name: string;
  description?: string;
  items: IReadingListItem[];
  isPublic: boolean;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}
