'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Box, Container, Typography, Button, Grid, Card, CardContent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import GroupIcon from '@mui/icons-material/Group';
import styles from './LandingPage.module.css';
import en from '@/dictionaries/en.json'
import fr from '@/dictionaries/fr.json'
import ar from '@/dictionaries/ar.json'

const dictionaries = { en, fr, ar };

export default function LandingPage() {
  const params = useParams();
  const lang = (params?.lang as string) || 'en';
  const t = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;

  const features = [
    {
      icon: <SearchIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: t.feature1Title,
      description: t.feature1Description
    },
    {
      icon: <GroupIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: t.feature2Title,
      description: t.feature2Description
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: t.feature3Title,
      description: t.feature3Description
    }
  ];

  return (
    <Box className={styles.landingContainer}>

      <Box className={styles.heroSection}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography 
                component="h1" 
                variant="h2" 
                className={styles.heroTitle}
              >
                {t.heroTitle}
              </Typography>
              <Typography 
                variant="h6" 
                className={styles.heroSubtitle}
              >
                {t.heroSubtitle}
              </Typography>
              <Box className={styles.heroButtons}>
                <Button 
                  component={Link} 
                  href={`/${lang}/signup`} 
                  variant="contained" 
                  size="large" 
                  color="primary"
                >
                  {t.heroButtonTrial}
                </Button>
                <Button variant="outlined" size="large">
                  {t.heroButtonDemo}
                </Button>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box className={styles.heroImagePlaceholder}>
                <Typography color="text.secondary">
                  {t.heroImagePlaceholder}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>

      {/* map section */}
      <Box className={styles.mapSection}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom>
            {t.mapTitle || 'Our Location'}
          </Typography>
          <iframe
            className={styles.mapIframe}
            src="https://www.openstreetmap.org/export/embed.html?bbox=-0.12%2C51.50%2C-0.08%2C51.52&layer=mapnik&marker=51.505%2C-0.09"
            loading="lazy"
          />
        </Container>
      </Box>
      </Box>

      <Container maxWidth="lg" className={styles.featuresSection}>
        <Typography 
          variant="h4" 
          component="h2" 
          className={styles.featuresTitle}
        >
          {t.featuresTitle}
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <Card className={styles.featureCard}>
                <CardContent>
                  <Box className={styles.featureIconWrapper}>
                    {feature.icon}
                  </Box>
                  <Typography 
                    variant="h5" 
                    component="h3" 
                    className={styles.featureCardTitle}
                  >
                    {feature.title}
                  </Typography>
                  <Typography className={styles.featureDescription}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box component="footer" className={styles.footer}>
        <Container maxWidth="sm">
          <Typography variant="body2" className={styles.footerText}>
            {t.footerCopyright.replace('{year}', new Date().getFullYear().toString())}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}