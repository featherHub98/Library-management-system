import BorrowingRecord, { IBorrowingRecord } from '../models/mongo/BorrowingRecord';
import { IBorrowingRecordResponse, CreateBorrowingDto, DAILY_FINE_AMOUNT, MAX_BORROW_DAYS } from '../dtos/borrowing.dto';

class BorrowingService {
  async borrowBook(dto: CreateBorrowingDto): Promise<IBorrowingRecordResponse> {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + MAX_BORROW_DAYS);

    const record = new BorrowingRecord({
      userId: dto.userId,
      username: dto.username,
      bookId: dto.bookId,
      borrowDate: new Date(),
      dueDate,
      status: 'borrowed',
    });

    await record.save();
    return this.mapToResponse(record);
  }

  async returnBook(userId: string, bookId: string): Promise<IBorrowingRecordResponse | null> {
    const record = await BorrowingRecord.findOne({
      userId,
      bookId,
      status: { $in: ['borrowed', 'overdue'] },
    });

    if (!record) return null;

    record.returnDate = new Date();
    record.status = 'returned';

    // Calculate fine if overdue
    if (new Date() > record.dueDate) {
      const daysOverdue = Math.floor(
        (new Date().getTime() - record.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      record.fineAmount = daysOverdue * DAILY_FINE_AMOUNT;
    }

    await record.save();
    return this.mapToResponse(record);
  }

  async getUserBorrowingHistory(userId: string, page: number = 1, limit: number = 10): Promise<{
    records: IBorrowingRecordResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const records = await BorrowingRecord.find({ userId })
      .sort({ borrowDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BorrowingRecord.countDocuments({ userId });

    return {
      records: records.map((r) => this.mapToResponse(r)),
      total,
      page,
      limit,
    };
  }

  async getOverdueBooks(): Promise<IBorrowingRecordResponse[]> {
    const records = await BorrowingRecord.find({
      status: 'borrowed',
      dueDate: { $lt: new Date() },
    }).sort({ dueDate: 1 });

    return records.map((r) => this.mapToResponse(r));
  }

  async getUserOverdueBooks(userId: string): Promise<IBorrowingRecordResponse[]> {
    const records = await BorrowingRecord.find({
      userId,
      status: 'borrowed',
      dueDate: { $lt: new Date() },
    });

    return records.map((r) => this.mapToResponse(r));
  }

  async updateFineStatus(recordId: string, finePaid: boolean): Promise<IBorrowingRecordResponse | null> {
    const record = await BorrowingRecord.findByIdAndUpdate(
      recordId,
      { finePaid },
      { new: true }
    );

    if (!record) return null;
    return this.mapToResponse(record);
  }

  async getTotalUnpaidFines(userId: string): Promise<number> {
    const records = await BorrowingRecord.find({
      userId,
      finePaid: false,
      fineAmount: { $gt: 0 },
    });

    return records.reduce((sum, r) => sum + r.fineAmount, 0);
  }

  private mapToResponse(record: IBorrowingRecord): IBorrowingRecordResponse {
    const daysOverdue = Math.max(
      0,
      Math.floor(
        (new Date().getTime() - record.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    );

    return {
      id: record._id?.toString() || '',
      userId: record.userId,
      username: record.username,
      bookId: record.bookId,
      borrowDate: record.borrowDate,
      dueDate: record.dueDate,
      returnDate: record.returnDate,
      daysOverdue,
      fineAmount: record.fineAmount,
      finePaid: record.finePaid,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}

export default new BorrowingService();
