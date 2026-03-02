import { Router } from 'express';
import borrowingController from '../controllers/borrowing.controller';

const router = Router();

// Borrow and return
router.post('/borrow', borrowingController.borrowBook.bind(borrowingController));
router.post('/return', borrowingController.returnBook.bind(borrowingController));

// History
router.get('/history/:userId', borrowingController.getUserBorrowingHistory.bind(borrowingController));

// Overdue books
router.get('/overdue', borrowingController.getOverdueBooks.bind(borrowingController));
router.get('/overdue/:userId', borrowingController.getUserOverdueBooks.bind(borrowingController));

// Fines
router.put('/fine/:recordId', borrowingController.updateFineStatus.bind(borrowingController));
router.get('/fines/:userId', borrowingController.getTotalUnpaidFines.bind(borrowingController));

export default router;
