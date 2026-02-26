import { Router } from 'express';
import BookController from '../controllers/book.controller';
import ImageController from '../controllers/image.controller';
import multer from 'multer';
import { validateBookCreation, validateBookUpdate, validateBookQuery, validateBooking } from '../middleware/validation.middleware';
import BookingController from '../controllers/booking.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('image'), validateBookCreation, BookController.createBook);
router.get('/', validateBookQuery, BookController.getAllBooks);
router.get('/author/:author?', BookController.getBooksByAuthor);
router.get('/:id', BookController.getBookById);
router.put('/:id', validateBookUpdate, BookController.updateBook);
router.delete('/:id', BookController.deleteBook);
router.get('/price/range', BookController.getBooksByPriceRange);

router.get('/:bookId/bookings', BookingController.getBookings);
router.post('/:bookId/bookings', validateBooking, BookingController.createBooking);


router.post('/:bookId/image', upload.single('image'), ImageController.uploadImage);
router.get('/:bookId/image', ImageController.getImage);
router.delete('/:bookId/image', ImageController.deleteImage);

export default router;