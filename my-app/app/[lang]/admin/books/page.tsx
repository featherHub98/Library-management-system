'use client';

import { useState, useEffect } from 'react';
import {
  Container, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Box, Alert, IconButton,
  TablePagination, Avatar, Chip, Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { styled } from '@mui/material/styles';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 'bold',
  },
}));

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
  hasImage?: boolean;
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editForm, setEditForm] = useState({ title: '', author: '', basePrice: '', format: 'physical', stock: '0' });
  const [createForm, setCreateForm] = useState({ title: '', author: '', basePrice: '', format: 'physical', stock: '0' });
  const [bookings, setBookings] = useState<{ startDate: string; endDate: string }[]>([]);
  const [bookingDates, setBookingDates] = useState<{ start?: string; end?: string }>({});
  const [createImageFile, setCreateImageFile] = useState<File | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
        setBooks(data.data || []);
        if (data.total !== undefined) setTotal(data.total);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch books');
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

  const handleCreateBook = async () => {
    if (!createForm.title || !createForm.author || !createForm.basePrice || !createForm.format) {
      setError('All fields are required');
      return;
    }

    const formData = new FormData();
    formData.append('title', createForm.title);
    formData.append('author', createForm.author);
    formData.append('basePrice', createForm.basePrice.toString());
    formData.append('format', createForm.format);
    if (createForm.format === 'physical') {
      formData.append('stock', createForm.stock.toString());
    }
    if (createImageFile) {
      formData.append('image', createImageFile);
    }

    try {
      setError(null);
      const response = await fetch('/api/books', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSuccess('Book created successfully');
        setCreateModalOpen(false);
        setCreateForm({ title: '', author: '', basePrice: '', format: 'physical', stock: '0' });
        setCreateImageFile(null);
        fetchBooks();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create book');
      }
    } catch (err: unknown) {
      let message = 'Failed to create book';
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    }
  };

  const handleUpdateBook = async () => {
    if (!editingBook || !editForm.title || !editForm.author || !editForm.basePrice || !editForm.format) {
      setError('All fields are required');
      return;
    }

    try {
      setError(null);
      
      // If there's a new image, use FormData
      if (editImageFile) {
        const formData = new FormData();
        formData.append('title', editForm.title);
        formData.append('author', editForm.author);
        formData.append('basePrice', editForm.basePrice.toString());
        formData.append('format', editForm.format);
        if (editForm.format === 'physical') {
          formData.append('stock', editForm.stock.toString());
        }
        formData.append('image', editImageFile);

        const response = await fetch(`/api/books/${editingBook._id || editingBook.id}`, {
          method: 'PUT',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update book');
        }
      } else {
        // No new image, use JSON
        const response = await fetch(`/api/books/${editingBook._id || editingBook.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: editForm.title,
            author: editForm.author,
            basePrice: parseFloat(editForm.basePrice),
            format: editForm.format,
            stock: editForm.format === 'physical' ? parseInt(editForm.stock, 10) : 0,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update book');
        }
      }

      setSuccess('Book updated successfully');
      setEditModalOpen(false);
      setEditingBook(null);
      setEditImageFile(null);
      setEditImagePreview(null);
      fetchBooks();
    } catch (err: unknown) {
      let message = 'Failed to update book';
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Book deleted successfully');
        fetchBooks();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete book');
      }
    } catch (err: unknown) {
      let message = 'Failed to delete book';
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    }
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setEditForm({
      title: book.title,
      author: book.author,
      basePrice: book.basePrice?.toString() || '',
      format: book.format || 'physical',
      stock: (book.stock ?? 0).toString(),
    });
    setEditImageFile(null);
    setEditImagePreview(book.hasImage ? `/api/books/${book._id || book.id}/image` : null);
    setBookingDates({});
    
    fetch(`/api/books/${book._id || book.id}/bookings`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setBookings(data.data || []))
      .catch(() => setBookings([]));

    setEditModalOpen(true);
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCreateImageFile(file);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleCreateBooking = async () => {
    if (!editingBook || !bookingDates.start || !bookingDates.end) {
      setError('Select start and end dates');
      return;
    }
    try {
      const resp = await fetch(`/api/books/${editingBook._id || editingBook.id}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate: bookingDates.start, endDate: bookingDates.end }),
      });
      if (resp.ok) {
        setSuccess('Booking created');
        const data = await resp.json();
        setBookings(prev => [...prev, data.data]);
        setBookingDates({});
      } else {
        const err = await resp.json();
        setError(err.error || 'Failed to book');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to book');
    }
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin - Book Management
        </Typography>
        <Typography>Loading books...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Admin - Book Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setCreateModalOpen(true)}
        >
          Add New Book
        </Button>
      </Box>

      <Box mb={2}>
        <TextField
          label="Search"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
        />
      </Box>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
        <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>
      </Snackbar>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Image</StyledTableCell>
              <StyledTableCell>Title</StyledTableCell>
              <StyledTableCell>Author</StyledTableCell>
              <StyledTableCell>Format</StyledTableCell>
              <StyledTableCell>Base Price</StyledTableCell>
              <StyledTableCell>Price</StyledTableCell>
              <StyledTableCell>Stock</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book._id || book.id}>
                <TableCell>
                  <Avatar
                    variant="rounded"
                    src={book.hasImage ? `/api/books/${book._id || book.id}/image` : undefined}
                    sx={{ width: 50, height: 70, bgcolor: 'grey.200' }}
                  >
                    {!book.hasImage && <PhotoCamera />}
                  </Avatar>
                </TableCell>
                <TableCell>{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>
                  <Chip 
                    label={book.format || 'physical'} 
                    size="small"
                    color={book.format === 'ebook' ? 'info' : 'default'}
                  />
                </TableCell>
                <TableCell>${book.basePrice?.toFixed(2) || '-'}</TableCell>
                <TableCell>${book.price}</TableCell>
                <TableCell>{book.format === 'physical' ? (book.stock ?? 0) : '-'}</TableCell>
                <TableCell>
                  {book.format === 'physical' && (
                    <Chip
                      label={book.status === 'out_of_stock' ? 'Out of stock' : 'In stock'}
                      color={book.status === 'out_of_stock' ? 'error' : 'success'}
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => openEditModal(book)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteBook(book._id || book.id || '')}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Create Dialog */}
      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Book</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Author"
            fullWidth
            value={createForm.author}
            onChange={(e) => setCreateForm({ ...createForm, author: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Base Price"
            type="number"
            fullWidth
            value={createForm.basePrice}
            onChange={(e) => setCreateForm({ ...createForm, basePrice: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Format"
            select
            fullWidth
            value={createForm.format}
            onChange={(e) => setCreateForm({ ...createForm, format: e.target.value })}
            sx={{ mb: 2 }}
            SelectProps={{ native: true }}
          >
            <option value="physical">Physical</option>
            <option value="ebook">E-Book</option>
          </TextField>
          {createForm.format === 'physical' && (
            <TextField
              margin="dense"
              label="Stock"
              type="number"
              fullWidth
              value={createForm.stock}
              onChange={(e) => setCreateForm({ ...createForm, stock: e.target.value })}
              sx={{ mb: 2 }}
            />
          )}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Book Image</Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera />}
            >
              Upload Image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleCreateImageChange}
              />
            </Button>
            {createImageFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected: {createImageFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateBook} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Book</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Author"
            fullWidth
            value={editForm.author}
            onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Base Price"
            type="number"
            fullWidth
            value={editForm.basePrice}
            onChange={(e) => setEditForm({ ...editForm, basePrice: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Format"
            select
            fullWidth
            value={editForm.format}
            onChange={(e) => setEditForm({ ...editForm, format: e.target.value })}
            sx={{ mb: 2 }}
            SelectProps={{ native: true }}
          >
            <option value="physical">Physical</option>
            <option value="ebook">E-Book</option>
          </TextField>
          {editForm.format === 'physical' && (
            <TextField
              margin="dense"
              label="Stock"
              type="number"
              fullWidth
              value={editForm.stock}
              onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
              sx={{ mb: 2 }}
            />
          )}

          {/* Image Upload Section */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Book Image</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {editImagePreview && (
                <Avatar
                  variant="rounded"
                  src={editImagePreview}
                  sx={{ width: 80, height: 100 }}
                />
              )}
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
              >
                {editImagePreview ? 'Change Image' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleEditImageChange}
                />
              </Button>
            </Box>
            {editImageFile && (
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                New image selected: {editImageFile.name}
              </Typography>
            )}
          </Box>

          {/* Bookings Section */}
          {editForm.format === 'physical' && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1">Booked Periods</Typography>
              {bookings.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No bookings yet</Typography>
              ) : (
                <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                  {bookings.map((b, idx) => (
                    <li key={idx}>
                      {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                    </li>
                  ))}
                </Box>
              )}

              <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                  label="From"
                  type="date"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={bookingDates.start || ''}
                  onChange={(e) => setBookingDates({ ...bookingDates, start: e.target.value })}
                />
                <TextField
                  label="To"
                  type="date"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={bookingDates.end || ''}
                  onChange={(e) => setBookingDates({ ...bookingDates, end: e.target.value })}
                />
                <Button variant="outlined" size="small" onClick={handleCreateBooking}>Add Booking</Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditModalOpen(false);
            setEditImageFile(null);
            setEditImagePreview(null);
          }}>Cancel</Button>
          <Button onClick={handleUpdateBook} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
