// Add this method to your existing book.service.ts file

/**
 * Notify users who have wishlisted a book when it becomes available
 * Call this method when book stock changes from 0 to > 0
 */
async notifyWishlistedUsers(bookId: string, bookTitle: string): Promise<void> {
  try {
    // Find all users who have this book in their wishlist
    const wishlists = await this.wishlistModel.find({ bookId }).exec();
    
    if (wishlists.length === 0) {
      return; // No users to notify
    }

    // Create notifications for each user
    const notifications = wishlists.map(wishlist => ({
      userId: wishlist.userId,
      type: 'book_available',
      title: 'Book Available!',
      message: `"${bookTitle}" is now back in stock! Reserve your copy now.`,
      bookId: bookId,
      isRead: false,
      createdAt: new Date()
    }));

    // Insert all notifications
    await this.notificationModel.insertMany(notifications);

    console.log(`Notified ${wishlists.length} users about book availability: ${bookTitle}`);
  } catch (error) {
    console.error('Error notifying wishlisted users:', error);
  }
}

/**
 * Example usage in updateBook method:
 */
async updateBook(id: string, updateData: Partial<Book>): Promise<Book | null> {
  const existingBook = await this.bookModel.findById(id).exec();
  
  const updatedBook = await this.bookModel
    .findByIdAndUpdate(id, updateData, { new: true })
    .exec();

  // Check if stock changed from 0 to > 0
  if (existingBook && existingBook.stock === 0 && updatedBook && updatedBook.stock > 0) {
    // Notify users who wishlisted this book
    await this.notifyWishlistedUsers(id, updatedBook.title);
  }

  return updatedBook;
}
