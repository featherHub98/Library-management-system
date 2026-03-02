export const DAILY_FINE_AMOUNT = 2; // $ per day overdue
export const MAX_BORROW_DAYS = 30; // days

export interface IBorrowingRecordResponse {
  id: string;
  userId: string;
  username: string;
  bookId: string;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  daysOverdue: number;
  fineAmount: number;
  finePaid: boolean;
  status: 'borrowed' | 'overdue' | 'returned';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBorrowingDto {
  userId: string;
  username: string;
  bookId: string;
}

export interface ReturnBookDto {
  userId: string;
  bookId: string;
}
