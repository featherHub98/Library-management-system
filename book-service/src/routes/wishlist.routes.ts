import { Router } from 'express';
import wishlistController from '../controllers/wishlist.controller';

const router = Router();

// Wishlist routes
router.post('/wishlist/add', wishlistController.addToWishlist.bind(wishlistController));
router.post('/wishlist/remove', wishlistController.removeFromWishlist.bind(wishlistController));
router.get('/wishlist/:userId', wishlistController.getWishlist.bind(wishlistController));

// Reading List routes
router.post('/reading-lists', wishlistController.createReadingList.bind(wishlistController));
router.put('/reading-lists/:readingListId', wishlistController.updateReadingList.bind(wishlistController));
router.delete('/reading-lists/:readingListId', wishlistController.deleteReadingList.bind(wishlistController));
router.get('/reading-lists/:readingListId', wishlistController.getReadingList.bind(wishlistController));
router.get('/reading-lists/user/:userId', wishlistController.getUserReadingLists.bind(wishlistController));
router.get('/reading-lists/public/browse', wishlistController.getPublicReadingLists.bind(wishlistController));

// Reading List items
router.post('/reading-lists/:readingListId/items', wishlistController.addToReadingList.bind(wishlistController));
router.delete('/reading-lists/:readingListId/items', wishlistController.removeFromReadingList.bind(wishlistController));
router.put('/reading-lists/:readingListId/items/:bookId', wishlistController.updateReadingListItem.bind(wishlistController));

export default router;
