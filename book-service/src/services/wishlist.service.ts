import Wishlist from '../models/mongo/Wishlist';
import ReadingList from '../models/mongo/ReadingList';
import { CreateReadingListDto, UpdateReadingListItemDto, UpdateReadingListDto } from '../dtos/wishlist.dto';
import { IWishlist, IReadingList, IReadingListResponse } from '../interfaces/wishlist.interface';

class WishlistService {
  private mapWishlistToDto(wishlist: any): IWishlist {
    return {
      id: wishlist._id?.toString() || '',
      userId: wishlist.userId,
      username: wishlist.username,
      items: wishlist.items,
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
    };
  }

  async addToWishlist(userId: string, username: string, bookId: string): Promise<IWishlist> {
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        userId,
        username,
        items: [],
      });
    }

    // Check if book already in wishlist
    const exists = wishlist.items.some((item) => item.bookId.toString() === bookId);

    if (!exists) {
      wishlist.items.push({
        bookId,
        addedAt: new Date(),
      });
    }

    await wishlist.save();
    return this.mapWishlistToDto(wishlist);
  }

  async removeFromWishlist(userId: string, bookId: string): Promise<IWishlist | null> {
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return null;
    }

    wishlist.items = wishlist.items.filter((item) => item.bookId.toString() !== bookId);
    await wishlist.save();

    return this.mapWishlistToDto(wishlist);
  }

  async getWishlist(userId: string): Promise<IWishlist | null> {
    const wishlist = await Wishlist.findOne({ userId });
    return wishlist ? this.mapWishlistToDto(wishlist) : null;
  }
}

class ReadingListService {
  private mapToResponse(readingList: any): IReadingListResponse {
    return {
      id: readingList._id?.toString() || '',
      userId: readingList.userId,
      username: readingList.username,
      name: readingList.name,
      description: readingList.description,
      items: readingList.items,
      isPublic: readingList.isPublic,
      itemCount: readingList.items.length,
      createdAt: readingList.createdAt,
      updatedAt: readingList.updatedAt,
    };
  }

  async createReadingList(dto: CreateReadingListDto): Promise<IReadingListResponse> {
    const readingList = new ReadingList({
      userId: dto.userId,
      username: dto.username,
      name: dto.name,
      description: dto.description || '',
      items: [],
      isPublic: false,
    });

    await readingList.save();
    return this.mapToResponse(readingList);
  }

  async updateReadingList(
    readingListId: string,
    dto: UpdateReadingListDto
  ): Promise<IReadingListResponse | null> {
    const readingList = await ReadingList.findByIdAndUpdate(readingListId, dto, {
      new: true,
    });

    if (!readingList) return null;
    return this.mapToResponse(readingList);
  }

  async deleteReadingList(readingListId: string): Promise<boolean> {
    const result = await ReadingList.findByIdAndDelete(readingListId);
    return result !== null;
  }

  async getReadingList(readingListId: string): Promise<IReadingListResponse | null> {
    const readingList = await ReadingList.findById(readingListId);

    if (!readingList) return null;
    return this.mapToResponse(readingList);
  }

  async getUserReadingLists(userId: string): Promise<IReadingListResponse[]> {
    const readingLists = await ReadingList.find({ userId }).sort({ createdAt: -1 });

    return readingLists.map((rl) => this.mapToResponse(rl));
  }

  async addToReadingList(readingListId: string, userId: string, bookId: string): Promise<IReadingListResponse | null> {
    const readingList = await ReadingList.findOne({
      _id: readingListId,
      userId,
    });

    if (!readingList) return null;

    // Check if book already in list
    const exists = readingList.items.some((item) => item.bookId.toString() === bookId);

    if (!exists) {
      readingList.items.push({
        bookId,
        status: 'want_to_read',
        addedAt: new Date(),
      } as any);

      await readingList.save();
    }

    return this.mapToResponse(readingList);
  }

  async removeFromReadingList(
    readingListId: string,
    userId: string,
    bookId: string
  ): Promise<IReadingListResponse | null> {
    const readingList = await ReadingList.findOne({
      _id: readingListId,
      userId,
    });

    if (!readingList) return null;

    readingList.items = readingList.items.filter((item) => item.bookId.toString() !== bookId);
    await readingList.save();

    return this.mapToResponse(readingList);
  }

  async updateReadingListItem(
    readingListId: string,
    userId: string,
    bookId: string,
    dto: UpdateReadingListItemDto
  ): Promise<IReadingListResponse | null> {
    const readingList = await ReadingList.findOne({
      _id: readingListId,
      userId,
    });

    if (!readingList) return null;

    const item = readingList.items.find((i) => i.bookId.toString() === bookId);

    if (!item) return null;

    if (dto.status) item.status = dto.status;
    if (dto.rating !== undefined) item.rating = dto.rating;
    if (dto.notes !== undefined) item.notes = dto.notes;

    if (dto.status === 'finished') {
      item.finishedAt = new Date();
    }

    await readingList.save();
    return this.mapToResponse(readingList);
  }

  async getPublicReadingLists(page: number = 1, limit: number = 10): Promise<{
    readingLists: IReadingListResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const readingLists = await ReadingList.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ReadingList.countDocuments({ isPublic: true });

    return {
      readingLists: readingLists.map((rl) => this.mapToResponse(rl)),
      total,
      page,
      limit,
    };
  }
}

export default new WishlistService();
export { ReadingListService };
export const readingListService = new ReadingListService();
