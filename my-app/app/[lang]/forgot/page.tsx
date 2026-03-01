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

export default function ForgotPage() {
  const params = useParams();
  const lang = (params?.lang as string) || 'en';
  const t = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await axios.post('/api/auth/forgot', { email });
      setSuccess('Verification code sent to your email');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <Paper elevation={3} className={styles.paper}>
        <Typography variant="h5" component="h1" className={styles.title}>
          {t.forgotTitle || 'Forgot Password'}
        </Typography>
        {error && <Alert severity="error" className={styles.errorAlert}>{error}</Alert>}
        {success && <Alert severity="success" className={styles.successAlert}>{success}</Alert>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <TextField
            label={t.email}
            type="email"
            variant="outlined"
            required
            fullWidth
            disabled={loading || !!success}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            disabled={loading || !!success}
            className={styles.submitButton}
          >
            {loading ? 'Sending...' : (t.forgotButton || 'Send code')}
          </Button>
        </form>
      </Paper>
    </main>
  );
}