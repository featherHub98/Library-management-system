'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Container, Typography, Box, Card, CardContent, CardMedia, Grid,
  Chip, Avatar, Divider, Button, IconButton, Tabs, Tab, Paper,
  Skeleton, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Tooltip
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
  Cake as CakeIcon,
  Public as PublicIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Book as BookIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  EmojiEvents as EmojiEventsIcon,
  MenuBook as MenuBookIcon
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

interface Book {
  _id?: string;
  id?: string;
  title: string;
  author: string;
  price: number;
  status?: 'in_stock' | 'out_of_stock';
  imageUrl?: string;
  categories?: string[];
}

export default function AuthorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || 'en';
  const authorId = params?.id as string;
  const t = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;
  const text = (key: string, fallback: string) => {
    const value = (t as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : fallback;
  };

  const [author, setAuthor] = useState<Author | null>(null);
  const [authorBooks, setAuthorBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Author>>({});
  const [userRole, setUserRole] = useState<'admin' | 'public' | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        setUserRole(data.role || null);
      } catch (err) {
        console.error('Auth check error:', err);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (authorId) {
      fetchAuthor();
      fetchAuthorBooks();
    }
  }, [authorId]);

  const fetchAuthor = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/authors/${authorId}`);
      if (response.ok) {
        const data = await response.json();
        setAuthor(data);
        setEditForm({
          name: data.name,
          bio: data.bio || '',
          email: data.email || '',
          phone: data.phone || '',
          nationality: data.nationality || '',
          birthDate: data.birthDate ? data.birthDate.split('T')[0] : '',
          website: data.website || '',
        });
      } else {
        setError('Author not found');
      }
    } catch (err) {
      setError('Failed to fetch author');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthorBooks = async () => {
    try {
      const response = await fetch(`/api/books?search=${encodeURIComponent(author?.name || '')}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        const books = Array.isArray(data) ? data : data.data || [];
        const filteredBooks = books.filter((book: Book) =>
          book.author.toLowerCase() === (author?.name?.toLowerCase() || '')
        );
        setAuthorBooks(filteredBooks);
      }
    } catch (err) {
      console.error('Failed to fetch author books:', err);
    }
  };

  const handleUpdateAuthor = async () => {
    if (!author) return;
    try {
      const response = await fetch(`/api/authors/${author._id || author.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (response.ok) {
        fetchAuthor();
        setEditDialogOpen(false);
      } else {
        setError('Failed to update author');
      }
    } catch (err) {
      setError('Failed to update author');
    }
  };

  const handleDeleteAuthor = async () => {
    if (!author) return;
    try {
      const response = await fetch(`/api/authors/${author._id || author.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        router.push(`/${lang}/authors`);
      } else {
        setError('Failed to delete author');
      }
    } catch (err) {
      setError('Failed to delete author');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3, borderRadius: 2 }} />
        <Skeleton variant="text" height={60} />
        <Skeleton variant="text" height={40} />
        <Skeleton variant="text" height={40} />
      </Container>
    );
  }

  if (error || !author) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Author not found'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push(`/${lang}/authors`)}
          sx={{ mt: 2 }}
        >
          Back to Authors
        </Button>
      </Container>
    );
  }

  const authorInitials = author.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        component={Link}
        href={`/${lang}/authors`}
        sx={{ mb: 3 }}
      >
        {text('backToAuthors', 'Back to Authors')}
      </Button>

      {/* Author Hero Section */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)',
          borderRadius: 3,
          overflow: 'hidden',
          mb: 4,
        }}
      >
        <Box sx={{ p: 4 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Avatar
                  sx={{
                    width: 180,
                    height: 180,
                    fontSize: 64,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    border: '4px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  }}
                >
                  {authorInitials}
                </Avatar>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 9 }}>
              <Typography
                variant="h3"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  mb: 2,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                {author.name}
              </Typography>
              {author.nationality && (
                <Chip
                  icon={<PublicIcon sx={{ color: 'white !important' }} />}
                  label={author.nationality}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    mb: 2,
                    '& .MuiChip-label': { color: 'white' },
                  }}
                />
              )}
              {author.bio && (
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '1.1rem',
                    lineHeight: 1.8,
                    maxWidth: 700,
                  }}
                >
                  {author.bio}
                </Typography>
              )}

              <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {author.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255,255,255,0.8)' }}>
                    <EmailIcon fontSize="small" />
                    <Typography variant="body2">{author.email}</Typography>
                  </Box>
                )}
                {author.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255,255,255,0.8)' }}>
                    <PhoneIcon fontSize="small" />
                    <Typography variant="body2">{author.phone}</Typography>
                  </Box>
                )}
                {author.website && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LanguageIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.8)' }} />
                    <Typography
                      variant="body2"
                      component="a"
                      href={author.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: '#4fc3f7', textDecoration: 'none' }}
                    >
                      {author.website}
                    </Typography>
                  </Box>
                )}
                {author.birthDate && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255,255,255,0.8)' }}>
                    <CakeIcon fontSize="small" />
                    <Typography variant="body2">
                      {new Date(author.birthDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Admin Actions */}
              {userRole === 'admin' && (
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => setEditDialogOpen(true)}
                    sx={{ mr: 2, bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Delete
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Tabs Section */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<MenuBookIcon />} label={`Books (${authorBooks.length})`} />
          {author.cvData?.education && <Tab icon={<SchoolIcon />} label="Education" />}
          {author.cvData?.experience && <Tab icon={<WorkIcon />} label="Experience" />}
          {author.cvData?.awards && <Tab icon={<EmojiEventsIcon />} label="Awards" />}
          {author.cvData?.skills && <Tab icon={<BookIcon />} label="Skills" />}
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {authorBooks.length === 0 ? (
                <Grid size={{ xs: 12 }}>
                  <Typography color="text.secondary" align="center">
                    No books found by this author
                  </Typography>
                </Grid>
              ) : (
                authorBooks.map((book) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={book._id || book.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ height: 180, bgcolor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {book.imageUrl ? (
                          <CardMedia component="img" image={book.imageUrl} alt={book.title} sx={{ height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <BookIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                        )}
                      </Box>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold" noWrap>{book.title}</Typography>
                        <Typography variant="body2" color="text.secondary">${book.price}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          )}

          {activeTab === 1 && author.cvData?.education && (
            <Box>
              {author.cvData.education.map((edu, idx) => (
                <Card key={idx} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{edu.degree} in {edu.field}</Typography>
                    <Typography color="primary">{edu.institution}</Typography>
                    <Typography variant="body2" color="text.secondary">{edu.startYear} - {edu.endYear || 'Present'}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {activeTab === 2 && author.cvData?.experience && (
            <Box>
              {author.cvData.experience.map((exp, idx) => (
                <Card key={idx} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{exp.position}</Typography>
                    <Typography color="primary">{exp.company}</Typography>
                    <Typography variant="body2" color="text.secondary">{exp.startYear} - {exp.endYear || 'Present'}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {activeTab === 3 && author.cvData?.awards && (
            <Box>
              {author.cvData.awards.map((award, idx) => (
                <Card key={idx} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{award.title}</Typography>
                    <Typography color="primary">{award.organization}</Typography>
                    <Typography variant="body2" color="text.secondary">{award.year}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {activeTab === 4 && author.cvData?.skills && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {author.cvData.skills.map((skill, idx) => (
                <Chip key={idx} label={skill} color="primary" variant="outlined" />
              ))}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Author</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Name" required value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Biography" multiline rows={3} value={editForm.bio || ''} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Email" type="email" value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Phone" value={editForm.phone || ''} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Nationality" value={editForm.nationality || ''} onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Birth Date" type="date" InputLabelProps={{ shrink: true }} value={editForm.birthDate || ''} onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Website" value={editForm.website || ''} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateAuthor} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Author</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete {author.name}? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAuthor} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
