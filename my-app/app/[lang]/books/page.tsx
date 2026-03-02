'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container, Typography, Card, CardContent, CardMedia, CardActions,
  Box, Alert, TextField, TablePagination, Button, Chip, IconButton,
  Tooltip, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, CircularProgress
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import BookIcon from '@mui/icons-material/Book';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import en from '@/dictionaries/en.json';
import fr from '@/dictionaries/fr.json';
import ar from '@/dictionaries/ar.json';
import styles from './page.module.css';

const dictionaries = { en, fr, ar };

interface Book {
  _id?: string;
  id?: string;
  title: string;
  author: string;
  authorId?: string;
  basePrice?: number;
  format?: 'ebook' | 'physical';
  price: number;
  stock?: number;
  status?: 'in_stock' | 'out_of_stock';
  available?: boolean;
  categories?: string[];
  description?: string;
  hasImage?: boolean;
}

interface BorrowState {
  bookId: string;
  loading: boolean;
}

export default function BooksPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || 'en';
  const t = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;
  const text = (key: string, fallback: string) => {
    const value = (t as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : fallback;
  };

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [total, setTotal] = useState(0);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Borrow states
  const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [borrowDates, setBorrowDates] = useState({ start: '', end: '' });
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Track which book is being borrowed
  const [borrowingBookId, setBorrowingBookId] = useState<string | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks();
  }, [searchTerm, page, rowsPerPage]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
        if (data.isAuthenticated) {
          fetchWishlist();
        }
      } catch (err) {
        console.error('Auth check error:', err);
      }
    };
    checkAuth();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
        const wishlistItemIds = data.items?.map((item: { bookId: string }) => item.bookId) || [];
        setWishlist(wishlistItemIds);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    }
  };

  const toggleWishlist = async (bookId: string) => {
    if (!isAuthenticated) {
      router.push(`/${lang}/login`);
      return;
    }

    const isWishlisted = wishlist.includes(bookId);
    setWishlistLoading(bookId);

    try {
      const method = isWishlisted ? 'DELETE' : 'POST';
      const response = await fetch('/api/wishlist', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId }),
      });

      if (response.ok) {
        if (isWishlisted) {
          setWishlist(prev => prev.filter(id => id !== bookId));
          setSnackbar({ open: true, message: 'Removed from wishlist', severity: 'success' });
        } else {
          setWishlist(prev => [...prev, bookId]);
          setSnackbar({ open: true, message: 'Added to wishlist! You will be notified when available.', severity: 'success' });
        }
      } else {
        const errorData = await response.json();
        setSnackbar({ open: true, message: errorData.error || 'Failed to update wishlist', severity: 'error' });
      }
    } catch (err) {
      console.error('Error updating wishlist:', err);
      setSnackbar({ open: true, message: 'Failed to update wishlist', severity: 'error' });
    } finally {
      setWishlistLoading(null);
    }
  };

  const fetchBooks = async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      params.append('page', (page + 1).toString());
      params.append('limit', rowsPerPage.toString());

      const response = await fetch(`/api/books?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const bookList = Array.isArray(data) ? data : data.data || [];
        setBooks(bookList);
        if (data.total !== undefined) setTotal(data.total);
      } else {
        setError('Failed to fetch books');
      }
    } catch (err: unknown) {
      let message = 'Failed to fetch books';
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowClick = (book: Book) => {
    if (!isAuthenticated) {
      router.push(`/${lang}/login`);
      return;
    }
    
    if (book.format === 'ebook') {
      // For ebooks, just "borrow" immediately
      handleBorrowEbook(book);
    } else {
      // For physical books, open date picker dialog
      setSelectedBook(book);
      setBorrowDates({ start: '', end: '' });
      setBorrowDialogOpen(true);
    }
  };

  const handleBorrowEbook = async (book: Book) => {
    const bookId = book._id || book.id || '';
    setBorrowingBookId(bookId);
    
    try {
      const response = await fetch(`/api/books/${bookId}/borrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'ebook' }),
      });

      if (response.ok) {
        setSnackbar({ open: true, message: `Successfully borrowed "${book.title}"! Check your email for the ebook link.`, severity: 'success' });
      } else {
        const errorData = await response.json();
        setSnackbar({ open: true, message: errorData.error || 'Failed to borrow ebook', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to borrow ebook', severity: 'error' });
    } finally {
      setBorrowingBookId(null);
    }
  };

  const handleConfirmBorrow = async () => {
    if (!selectedBook || !borrowDates.start || !borrowDates.end) {
      setSnackbar({ open: true, message: 'Please select both start and end dates', severity: 'error' });
      return;
    }

    const bookId = selectedBook._id || selectedBook.id || '';
    setBorrowLoading(true);

    try {
      const response = await fetch(`/api/books/${bookId}/borrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'physical',
          startDate: borrowDates.start,
          endDate: borrowDates.end,
        }),
      });

      if (response.ok) {
        setSnackbar({ open: true, message: `Successfully borrowed "${selectedBook.title}" from ${borrowDates.start} to ${borrowDates.end}!`, severity: 'success' });
        setBorrowDialogOpen(false);
        fetchBooks(); // Refresh to update stock
      } else {
        const errorData = await response.json();
        setSnackbar({ open: true, message: errorData.error || 'Failed to borrow book', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to borrow book', severity: 'error' });
    } finally {
      setBorrowLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" className={styles.loadingContainer}>
        <Typography variant="h4" component="h1" gutterBottom>
          {text('books', 'Books')}
        </Typography>
        <Typography className={styles.loadingText}>{text('loading', 'Loading books...')}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className={styles.container}>
      <Typography variant="h4" component="h1" gutterBottom className={styles.header}>
        {text('books', 'Books')}
      </Typography>

      <Box className={styles.searchContainer}>
        <TextField
          fullWidth
          label={text('search', 'Search')}
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
        />
      </Box>

      {error && (
        <Alert severity="error" className={styles.errorAlert}>
          {error}
        </Alert>
      )}

      <Box className={styles.booksGrid}>
        {books.map((book) => {
          const bookId = book._id || book.id || '';
          const isWishlisted = wishlist.includes(bookId);
          const isBorrowing = borrowingBookId === bookId;
          const isWishlistLoadingThis = wishlistLoading === bookId;
          const imageUrl = book.hasImage ? `/api/books/${bookId}/image` : null;

          return (
            <Card
              key={bookId}
              className={styles.bookCard}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <Box
                sx={{
                  height: 180,
                  bgcolor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {imageUrl ? (
                  <CardMedia
                    component="img"
                    image={imageUrl}
                    alt={book.title}
                    sx={{
                      height: '100%',
                      width: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <BookIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                )}
                {book.status === 'out_of_stock' && (
                  <Chip
                    label="Out of Stock"
                    color="error"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                    }}
                  />
                )}
                {book.format === 'ebook' && (
                  <Chip
                    label="E-Book"
                    color="info"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                    }}
                  />
                )}
                {isWishlisted && (
                  <Chip
                    icon={<FavoriteIcon sx={{ fontSize: 16 }} />}
                    label="Wishlisted"
                    color="secondary"
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                    }}
                  />
                )}
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  variant="subtitle1"
                  component="h2"
                  sx={{
                    fontWeight: 'bold',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {book.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { color: 'primary.main' },
                  }}
                  onClick={() => {
                    if (book.authorId) {
                      router.push(`/${lang}/authors/${book.authorId}`);
                    }
                  }}
                >
                  {text('by', 'by')} {book.author}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                  ${book.price.toFixed(2)}
                </Typography>
                {book.format === 'physical' && book.stock !== undefined && (
                  <Typography variant="caption" color="text.secondary">
                    {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
                  </Typography>
                )}
                {book.categories && book.categories.length > 0 && (
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {book.categories.slice(0, 2).map((cat, idx) => (
                      <Chip key={idx} label={cat} size="small" variant="outlined" />
                    ))}
                  </Box>
                )}
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={isBorrowing ? <CircularProgress size={16} color="inherit" /> : <ShoppingCartIcon />}
                  disabled={book.status === 'out_of_stock' || isBorrowing}
                  onClick={() => handleBorrowClick(book)}
                >
                  {book.format === 'ebook' ? 'Read Now' : 'Borrow'}
                </Button>
                <Tooltip title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}>
                  <IconButton
                    onClick={() => toggleWishlist(bookId)}
                    color={isWishlisted ? 'error' : 'default'}
                    disabled={isWishlistLoadingThis}
                  >
                    {isWishlistLoadingThis ? (
                      <CircularProgress size={24} />
                    ) : isWishlisted ? (
                      <FavoriteIcon />
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          );
        })}
      </Box>

      {books.length === 0 && !loading && (
        <Box className={styles.emptyState}>
          <Typography variant="h6">
            {text('noBooks', 'No books available')}
          </Typography>
        </Box>
      )}

      {total > rowsPerPage && (
        <Box className={styles.paginationContainer}>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          />
        </Box>
      )}

      {/* Borrow Dialog for Physical Books */}
      <Dialog open={borrowDialogOpen} onClose={() => setBorrowDialogOpen(false)}>
        <DialogTitle>Borrow "{selectedBook?.title}"</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={borrowDates.start}
              onChange={(e) => setBorrowDates({ ...borrowDates, start: e.target.value })}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
            />
            <TextField
              label="End Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={borrowDates.end}
              onChange={(e) => setBorrowDates({ ...borrowDates, end: e.target.value })}
              inputProps={{ min: borrowDates.start || new Date().toISOString().split('T')[0] }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBorrowDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmBorrow} 
            variant="contained" 
            disabled={!borrowDates.start || !borrowDates.end || borrowLoading}
          >
            {borrowLoading ? <CircularProgress size={20} color="inherit" /> : 'Confirm Borrow'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
