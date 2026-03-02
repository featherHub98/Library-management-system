'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Box, Container, Typography, Button, Grid, Card, CardContent, Select, MenuItem, FormControl,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import GroupIcon from '@mui/icons-material/Group';
import BookIcon from '@mui/icons-material/Book';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import styles from './LandingPage.module.css';
import en from '@/dictionaries/en.json'
import fr from '@/dictionaries/fr.json'
import ar from '@/dictionaries/ar.json'

const dictionaries = { en, fr, ar };

type LocationPoint = {
  country: string;
  city: string;
  area?: string;
  lat: number;
  lng: number;
};

const locations: LocationPoint[] = [
  { country: 'Algeria', city: 'Algiers', area: 'Hydra', lat: 36.752887, lng: 3.042048 },
  { country: 'Algeria', city: 'Oran', area: 'Centre-ville', lat: 35.696944, lng: -0.633056 },
  { country: 'Algeria', city: 'Constantine', lat: 36.365, lng: 6.614722 },
  { country: 'Tunisia', city: 'Tunis', area: 'Lac 2', lat: 36.8008, lng: 10.18 },
  { country: 'Tunisia', city: 'Sousse', lat: 35.8256, lng: 10.6369 },
  { country: 'Tunisia', city: 'Sfax', lat: 34.74, lng: 10.76 },
  { country: 'Morocco', city: 'Casablanca', lat: 33.5731, lng: -7.5898 },
  { country: 'Morocco', city: 'Rabat', lat: 34.0209, lng: -6.8416 },
  { country: 'Egypt', city: 'Cairo', lat: 30.0444, lng: 31.2357 },
  { country: 'Egypt', city: 'Giza', lat: 30.0131, lng: 31.2089 },
  { country: 'UAE', city: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { country: 'France', city: 'Paris', lat: 48.8566, lng: 2.3522 },
  { country: 'Jordan', city: 'Amman', lat: 31.9454, lng: 35.9284 },
  { country: 'Saudi Arabia', city: 'Riyadh', lat: 24.7136, lng: 46.6753 },
];

export default function LandingPage() {
  const params = useParams();
  const lang = (params?.lang as string) || 'en';
  const t = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;
  const [selectedLocation, setSelectedLocation] = useState<LocationPoint>(
    locations.find((location) => location.city === 'Sousse') || locations[0]
  );

  // Better zoom: smaller bbox for more zoomed in view
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${selectedLocation.lng - 0.07}%2C${selectedLocation.lat - 0.07}%2C${selectedLocation.lng + 0.07}%2C${selectedLocation.lat + 0.07}&layer=mapnik&marker=${selectedLocation.lat}%2C${selectedLocation.lng}`;

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
    },
    {
      icon: <BookIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Borrowing & Reservations',
      description: 'Seamlessly manage book loans, reservations, and returns with automated tracking and reminders.'
    },
    {
      icon: <NotificationsIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Smart Notifications',
      description: 'Keep members informed with timely alerts for due dates, available books, and new recommendations.'
    },
    {
      icon: <FolderSpecialIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Author Management',
      description: 'Organize and maintain comprehensive author profiles with CV, publications, and achievements.'
    },
    {
      icon: <FavoriteBorderIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Wishlists & Reading Lists',
      description: 'Let members curate personalized collections and share their favorite books with the community.'
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Recommendations',
      description: 'AI-powered suggestions based on borrowing history and reading preferences to keep members engaged.'
    },
    {
      icon: <AdminPanelSettingsIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Admin Dashboard',
      description: 'Complete control with role-based access, user management, and comprehensive reporting tools.'
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
                  sx={{
                    background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #00b8d4 0%, #0077aa 100%)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {t.heroButtonTrial}
                </Button>
                <Button 
                  component={Link}
                  href={`/${lang}/books`}
                  variant="outlined" 
                  size="large"
                  sx={{
                    borderColor: 'rgba(255,255,255,0.8)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Browse Books
                </Button>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box className={styles.heroImagePlaceholder}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Card sx={{ textAlign: 'center', p: 2, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                      <Typography variant="h4" sx={{ color: '#00d4ff', fontWeight: 'bold', mb: 1 }}>5000+</Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Books Available</Typography>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Card sx={{ textAlign: 'center', p: 2, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                      <Typography variant="h4" sx={{ color: '#00d4ff', fontWeight: 'bold', mb: 1 }}>10k+</Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Active Members</Typography>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Card sx={{ textAlign: 'center', p: 2, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                      <Typography variant="h4" sx={{ color: '#00d4ff', fontWeight: 'bold', mb: 1 }}>14</Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Locations</Typography>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Card sx={{ textAlign: 'center', p: 2, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                      <Typography variant="h4" sx={{ color: '#00d4ff', fontWeight: 'bold', mb: 1 }}>24/7</Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Online Access</Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Container>

      <Box className={styles.mapSection}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h2">
              {t.mapTitle || 'Our Locations'}
            </Typography>
            <FormControl sx={{ minWidth: 250 }}>
              <Select
                value={selectedLocation.city}
                onChange={(e) => {
                  const location = locations.find(loc => loc.city === e.target.value);
                  if (location) setSelectedLocation(location);
                }}
                sx={{
                  backgroundColor: 'background.paper',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              >
                {locations.map((location) => (
                  <MenuItem 
                    key={`${location.country}-${location.city}`} 
                    value={location.city}
                  >
                    📍 {location.city}, {location.country}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ position: 'relative' }}>
            <iframe
              title="library-locations-map"
              className={styles.mapIframe}
              src={mapSrc}
              loading="lazy"
            />
            <Box className={styles.locationPopup}>
              <Typography 
                variant="subtitle1" 
                sx={{ fontWeight: 'bold', mb: 0.5 }}
              >
                📍 {selectedLocation.city}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mb: 0.25 }}>
                {selectedLocation.country}
              </Typography>
              {selectedLocation.area && (
                <Typography variant="caption" sx={{ color: '#666' }}>
                  {selectedLocation.area}
                </Typography>
              )}
            </Box>
          </Box>
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
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
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