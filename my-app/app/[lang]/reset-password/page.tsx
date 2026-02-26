'use client';

import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import axios from 'axios';
import { useParams } from 'next/navigation';
import styles from '../login/login.module.css';
import en from '@/dictionaries/en.json';
import fr from '@/dictionaries/fr.json';
import ar from '@/dictionaries/ar.json';

const dictionaries = { en, fr, ar };

export default function ResetPasswordPage() {
  const params = useParams();
  const lang = (params?.lang as string) || 'en';
  const t = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await axios.post('/api/auth/reset', { email, code, newPassword });
      setSuccess('Password updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <Paper elevation={3} className={styles.paper}>
        <Typography variant="h5" component="h1" className={styles.title}>
          {t.resetTitle || 'Reset Password'}
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label={t.email}
            type="email"
            variant="outlined"
            required
            fullWidth
            disabled={loading || !!success}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label={t.code || 'Verification Code'}
            variant="outlined"
            required
            fullWidth
            disabled={loading || !!success}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label={t.newPassword || 'New Password'}
            type="password"
            variant="outlined"
            required
            fullWidth
            disabled={loading || !!success}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" fullWidth disabled={loading || !!success}>
            {loading ? 'Updating...' : (t.resetButton || 'Reset')}
          </Button>
        </form>
      </Paper>
    </main>
  );
}