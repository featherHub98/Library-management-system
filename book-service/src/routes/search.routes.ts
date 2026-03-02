import { Router } from 'express';
import searchController from '../controllers/search.controller';

const router = Router();

// Advanced search
router.get('/advanced', searchController.advancedSearch.bind(searchController));

// Browse endpoints
router.get('/genre/:genre', searchController.getBooksByGenre.bind(searchController));
router.get('/author/:author', searchController.getAuthorBooks.bind(searchController));
router.get('/series/:series', searchController.getSeriesBooks.bind(searchController));

// Identifier search
router.get('/isbn/:isbn', searchController.searchByISBN.bind(searchController));
router.get('/barcode/:barcode', searchController.searchByBarcode.bind(searchController));

// Trending
router.get('/new-releases', searchController.getNewReleases.bind(searchController));

// Filter options
router.get('/filters', searchController.getFilterOptions.bind(searchController));

export default router;
