'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Container, Typography, Card, CardContent, CardActions,
  Box, Alert, TextField, TablePagination, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Avatar, Chip, Tooltip, Collapse, Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
  Cake as CakeIcon,
  Public as PublicIcon
} from '@mui/icons-material';
import en from '@/dictionaries/en.json';
import fr from '@/dictionaries/fr.json';
import ar from '@/dictionaries/ar.json';

const dictionaries = { en, fr, ar };

interface CVEducation {
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear?: number;
  description?: string;
}

interface CVExperience {
  company: string;
  position: string;
  startYear: number;
  endYear?: number;
  description?: string;
}

interface CVPublication {
  title: string;
  publisher: string;
  year: number;
  isbn?: string;
}

interface CVAward {
  title: string;
  organization: string;
  year: number;
  description?: string;
}

interface CVData {
  education?: CVEducation[];
  experience?: CVExperience[];
  publications?: CVPublication[];
  awards?: CVAward[];
  skills?: string[];
}

interface Author {
  _id?: string;
  id?: string;
  name: string;
  bio?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  birthDate?: string;
  website?: string;
  cvData?: CVData;
  hasCV?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function AuthorsPage() {
  const params = useParams();
  const lang = (params?.lang as string) || 'en';
  const t = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;
  const text = (key: string, fallback: string) => {
    const value = (t as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : fallback;
  };

  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [total, setTotal] = useState(0);
  const [expandedAuthor, setExpandedAuthor] = useState<string | null>(null);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [formData, setFormData] = useState<Partial<Author>>({});

  // Fetch authors
  const fetchAuthors = async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      params.append('page', (page + 1).toString());
      params.append('limit', rowsPerPage.toString());

      const response = await fetch(`/api/authors?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const authorList = Array.isArray(data) ? data : data.data || [];
        setAuthors(authorList);
        if (data.total !== undefined) setTotal(data.total);
      } else {
        setError(text('error', 'Failed to fetch authors'));
      }
    } catch (err: unknown) {
      let message = 'Failed to fetch authors';
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, [searchTerm, page, rowsPerPage]);

  // Dialog handlers
  const handleOpenDialog = (author?: Author) => {
    if (author) {
      setEditingAuthor(author);
      setFormData({
        name: author.name,
        bio: author.bio || '',
        email: author.email || '',
        phone: author.phone || '',
        nationality: author.nationality || '',
        birthDate: author.birthDate ? author.birthDate.split('T')[0] : '',
        website: author.website || '',
      });
    } else {
      setEditingAuthor(null);
      setFormData({
        name: '',
        bio: '',
        email: '',
        phone: '',
        nationality: '',
        birthDate: '',
        website: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAuthor(null);
    setFormData({});
  };

  const handleSaveAuthor = async () => {
    try {
      const url = editingAuthor ? `/api/authors/${editingAuthor._id || editingAuthor.id}` : '/api/authors';
      const method = editingAuthor ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchAuthors();
        handleCloseDialog();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save author');
      }
    } catch (err) {
      setError('Failed to save author');
    }
  };

  const handleDeleteClick = (author: Author) => {
    setEditingAuthor(author);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!editingAuthor) return;

    try {
      const response = await fetch(`/api/authors/${editingAuthor._id || editingAuthor.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAuthors();
        setDeleteDialogOpen(false);
        setEditingAuthor(null);
      } else {
        setError('Failed to delete author');
      }
    } catch (err) {
      setError('Failed to delete author');
    }
  };

  const handleDownloadCV = async (authorId: string) => {
    try {
      const response = await fetch(`/api/authors/${authorId}/cv`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'author_cv.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (err) {
      console.error('Failed to download CV:', err);
    }
  };

  const toggleExpand = (authorId: string) => {
    setExpandedAuthor(expandedAuthor === authorId ? null : authorId);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {text('authorsTitle', 'Authors')}
        </Typography>
        <Typography>{text('loading', 'Loading...')}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {text('authorsTitle', 'Authors')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          {text('addAuthor', 'Add Author')}
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label={text('search', 'Search')}
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
          placeholder={text('search', 'Search by name, nationality, or bio...')}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {authors.map((author) => {
          const authorId = author._id || author.id || '';
          const isExpanded = expandedAuthor === authorId;

          return (
            <Grid item xs={12} sm={6} md={4} key={authorId}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h2">
                        {author.name}
                      </Typography>
                      {author.nationality && (
                        <Chip
                          size="small"
                          label={author.nationality}
                          icon={<PublicIcon />}
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Box>
                  </Box>

                  {author.bio && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {author.bio}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {author.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {author.email}
                        </Typography>
                      </Box>
                    )}
                    {author.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {author.phone}
                        </Typography>
                      </Box>
                    )}
                    {author.website && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LanguageIcon fontSize="small" color="action" />
                        <Typography
                          variant="body2"
                          color="primary"
                          component="a"
                          href={author.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ textDecoration: 'none' }}
                        >
                          {author.website}
                        </Typography>
                      </Box>
                    )}
                    {author.birthDate && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CakeIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(author.birthDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {author.cvData && (
                    <>
                      <Divider sx={{ my: 1.5 }} />
                      <Button
                        size="small"
                        onClick={() => toggleExpand(authorId)}
                        endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      >
                        {text('cvData', 'CV Data')}
                      </Button>
                      <Collapse in={isExpanded}>
                        <Box sx={{ mt: 1 }}>
                          {author.cvData.skills && author.cvData.skills.length > 0 && (
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="subtitle2">{text('skills', 'Skills')}</Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                {author.cvData.skills.map((skill, idx) => (
                                  <Chip key={idx} label={skill} size="small" />
                                ))}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </>
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                  {author.hasCV && (
                    <Tooltip title={text('downloadCV', 'Download CV')}>
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadCV(authorId)}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title={text('edit', 'Edit')}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(author)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={text('delete', 'Delete')}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(author)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {authors.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">
            {text('noAuthors', 'No authors available')}
          </Typography>
        </Box>
      )}

      {total > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAuthor ? text('editAuthor', 'Edit Author') : text('addAuthor', 'Add Author')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={text('authorName', 'Name')}
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={text('authorBio', 'Biography')}
                multiline
                rows={3}
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={text('authorEmail', 'Email')}
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={text('authorPhone', 'Phone')}
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={text('authorNationality', 'Nationality')}
                value={formData.nationality || ''}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={text('authorBirthDate', 'Birth Date')}
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.birthDate || ''}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={text('authorWebsite', 'Website')}
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{text('cancel', 'Cancel')}</Button>
          <Button onClick={handleSaveAuthor} variant="contained">
            {text('save', 'Save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{text('deleteAuthor', 'Delete Author')}</DialogTitle>
        <DialogContent>
          <Typography>
            {text('confirmDeleteAuthor', 'Are you sure you want to delete this author?')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{text('cancel', 'Cancel')}</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            {text('delete', 'Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
