import { Router } from 'express';
import bulkOperationController from '../controllers/bulkOperation.controller';

const router = Router();

// Bulk operations
router.post('/import', bulkOperationController.bulkImport.bind(bulkOperationController));
router.get('/export', bulkOperationController.bulkExport.bind(bulkOperationController));

// Metadata endpoints
router.get('/categories', bulkOperationController.getCategories.bind(bulkOperationController));
router.get('/series', bulkOperationController.getSeries.bind(bulkOperationController));
router.get('/languages', bulkOperationController.getLanguages.bind(bulkOperationController));

// Search by metadata
router.get('/category/:category', bulkOperationController.searchByCategory.bind(bulkOperationController));
router.get('/series/:series', bulkOperationController.searchBySeries.bind(bulkOperationController));

export default router;
