'use client';

import { useState } from 'react';
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

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${selectedLocation.lng - 1.2}%2C${selectedLocation.lat - 0.8}%2C${selectedLocation.lng + 1.2}%2C${selectedLocation.lat + 0.8}&layer=mapnik&marker=${selectedLocation.lat}%2C${selectedLocation.lng}`;

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

      <Box className={styles.mapSection}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom>
            {t.mapTitle || 'Our Location'}
          </Typography>
          <Box className={styles.locationMarkers}>
            {locations.map((location) => {
              const isActive = location.city === selectedLocation.city;
              return (
                <Button
                  key={`${location.country}-${location.city}`}
                  variant={isActive ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setSelectedLocation(location)}
                >
                  📍 {location.city}
                </Button>
              );
            })}
          </Box>
          <iframe
            title="library-locations-map"
            className={styles.mapIframe}
            src={mapSrc}
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