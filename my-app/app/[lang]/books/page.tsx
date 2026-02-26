'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Container, Typography, Grid, Card, CardContent,
  Box, Alert, TextField, TablePagination
} from '@mui/material';
import en from '@/dictionaries/en.json';
import fr from '@/dictionaries/fr.json';
import ar from '@/dictionaries/ar.json';

const dictionaries = { en, fr, ar };

interface Book {
  _id?: string;
  id?: string;
  title: string;
  author: string;
  basePrice?: number;
  format?: 'ebook' | 'physical';
  price: number;
  available?: boolean;
}

export default function BooksPage() {
  const params = useParams();
  const lang = (params?.lang as string) || 'en';
  const t = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;

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
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t.books || 'Books'}
        </Typography>
        <Typography>{t.loading || 'Loading books...'}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t.books || 'Books'}
      </Typography>

      {/* search bar */}
      <Box mb={2}>
        <TextField
          fullWidth
          label={t.search || 'Search'}
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {books.map((book) => (
          <Grid item xs={12} sm={6} md={4} key={book._id || book.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {book.title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  {t.by || 'by'} {book.author}
                </Typography>
                <Typography variant="h6" color="primary">
                  ${book.price}
                </Typography>
                {book.format === 'physical' && book.available === false && (
                  <Typography variant="body2" color="error">
                    {t.unavailable || 'Currently unavailable'}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {books.length === 0 && !loading && (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" color="text.secondary">
            {t.noBooks || 'No books available'}
          </Typography>
        </Box>
      )}

      {/* pagination controls */}
      {total > rowsPerPage && (
        <Box mt={4} display="flex" justifyContent="center">
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