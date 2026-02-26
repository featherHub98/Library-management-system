'use client';

import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import Alert from '@mui/material/Alert';
import axios, { AxiosError } from 'axios';
import { useParams } from 'next/navigation';
import axios from 'axios';
import styles from './signup.module.css';
import en from '@/dictionaries/en.json'
import fr from '@/dictionaries/fr.json'
import ar from '@/dictionaries/ar.json'

const dictionaries = { en, fr, ar };

interface FormType {
  username: string;
  email: string;
  password: string;
}

export default function Signup() {
  const params = useParams();
  const lang = (params?.lang as string) || 'en';
  const t = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;

  const [formData, setFormData] = useState<FormType>({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await axios.post('/api/auth/signup', formData);
      setSuccess(true);
      console.log('Signup successful:', result.data);
    } catch (error: unknown) {
      let message = 'Signup failed. Please try again.';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.error || 
                  error.response?.data?.details ||
                  error.message || 
                  message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setError(message);
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <Paper elevation={3} className={styles.paper}>
        <Typography variant="h5" component="h1" className={styles.title}>
          {t.signupTitle}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Signup successful! Redirecting...
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label={t.username}
              variant="outlined"
              required
              fullWidth
              disabled={loading || success}
              value={formData.username}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, username: e.target.value }))
              }
            />

            <TextField
              label={t.email}
              type="email"
              variant="outlined"
              required
              fullWidth
              disabled={loading || success}
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
            />

            <TextField
              label={t.password}
              type="password"
              variant="outlined"
              required
              fullWidth
              disabled={loading || success}
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
            />

            <Button 
              type="submit" 
              variant="contained" 
              size="large" 
              fullWidth
              disabled={loading || success}
            >
              {loading ? 'Creating account...' : t.signup}
            </Button>

            <Link href={`/${lang}/login`} className={styles.link}>
              {t.alreadyHaveAccount}
            </Link>
          </Stack>
        </form>
      </Paper>
    </main>
  );
}