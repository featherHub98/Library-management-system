'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Container, Typography, Card, CardContent,
  Box, Alert, TextField, TablePagination
} from '@mui/material';
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
  basePrice?: number;
  format?: 'ebook' | 'physical';
  price: number;
  stock?: number;
  status?: 'in_stock' | 'out_of_stock';
  available?: boolean;
}

export default function BooksPage() {
  const params = useParams();
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

  useEffect(() => {
    fetchBooks();
  }, [searchTerm, page, rowsPerPage]);

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
        {books.map((book) => (
          <Box key={book._id || book.id}>
            <Card className={styles.bookCard}>
              <CardContent className={styles.bookCardContent}>
                <Typography variant="h6" component="h2" className={styles.bookTitle}>
                  {book.title}
                </Typography>
                <Typography className={styles.bookAuthor}>
                  {text('by', 'by')} {book.author}
                </Typography>
                <Typography className={styles.bookPrice}>
                  ${book.price}
                </Typography>
                {book.format === 'physical' && (
                  <>
                    <Typography className={styles.bookStock}>
                      <span className={styles.stockInfo}>Stock:</span> {book.stock ?? 0}
                    </Typography>
                    {book.status === 'out_of_stock' && (
                      <Typography className={styles.outOfStock}>
                        Out of stock
                      </Typography>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Box>
        ))}
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
    </Container>
  );
}