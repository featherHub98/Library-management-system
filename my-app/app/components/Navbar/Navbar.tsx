'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import {
  Box, AppBar, Toolbar, Typography, Button, IconButton,
  Drawer, List, ListItem, ListItemText, Menu, MenuItem, Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import TranslateIcon from '@mui/icons-material/Translate';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import LogoutIcon from '@mui/icons-material/Logout';
import styles from './Navbar.module.css';
import en from '@/dictionaries/en.json'
import fr from '@/dictionaries/fr.json'
import ar from '@/dictionaries/ar.json'

const dictionaries = { en, fr, ar };

export default function Navbar() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  
  const lang = (params?.lang as string) || 'en';
  const t = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'public' | null>(null);

  const decodeRoleFromToken = (token: string | null): 'admin' | 'public' | null => {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length < 2) return null;
    
    try {
      const payloadBase64 = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      const padded = payloadBase64 + '='.repeat((4 - (payloadBase64.length % 4)) % 4);
      const payload = JSON.parse(atob(padded)) as { role?: string };
      return (payload.role === 'admin' || payload.role === 'public') ? (payload.role as 'admin' | 'public') : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const role = decodeRoleFromToken(token);
        setIsAuthenticated(!!token);
        setUserRole(role);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setUserRole(null);
      }
    };
    checkAuth();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLanguageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      
      if (response.ok) {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setMobileOpen(false);
        router.push(`/${lang}/login`);
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const changeLocale = (newLocale: string) => {
    const pathWithoutLocale = pathname.replace(/^\/[^\/]+/, '') || '/';
    router.push(`/${newLocale}${pathWithoutLocale}`);
    handleLanguageMenuClose();
    setMobileOpen(false);
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'ar', name: 'العربية' },
  ];

  const navItems = [
    { label: t.home, href: `/${lang}` },
    { label: t.books, href: `/${lang}/books` },
    ...(isAuthenticated ? [] : [
      { label: t.login, href: `/${lang}/login` },
      { label: t.signup, href: `/${lang}/signup` },
    ]),
  ];

  const renderDesktopNav = () => (
    <Box className={styles.desktopNav}>
      <Button
        component={Link}
        href={`/${lang}/books`}
        className={styles.navLink}
      >
        {t.books}
      </Button>

      {userRole === 'admin' && (
        <Button
          component={Link}
          href={`/${lang}/admin/books`}
          className={styles.navLink}
        >
          Admin
        </Button>
      )}

      <IconButton
        color="inherit"
        onClick={handleLanguageMenuOpen}
      >
        <TranslateIcon />
      </IconButton>

      {isAuthenticated ? (
        <Button
          onClick={handleLogout}
          variant="outlined"
          className={styles.navButton}
          startIcon={<LogoutIcon />}
        >
          {t.logout || 'Logout'}
        </Button>
      ) : (
        <Button
          component={Link}
          href={pathname.includes('/login') ? `/${lang}/signup` : `/${lang}/login`}
          variant="outlined"
          className={styles.navButton}
        >
          {pathname.includes('/login') ? t.signup : t.login}
        </Button>
      )}
    </Box>
  );

  const renderDrawerContent = () => (
    <Box className={styles.drawerContent} onClick={handleDrawerToggle}>
      <Typography variant="h6" className={styles.drawerTitle}>
        {t.appName}
      </Typography>
      <List className={styles.drawerList}>
        {navItems.map((item) => (
          <ListItem 
            component={Link} 
            href={item.href} 
            key={item.label}
            className={styles.drawerListItem}
          >
            <ListItemText primary={item.label} />
          </ListItem>
        ))}

        {userRole === 'admin' && (
          <ListItem 
            component={Link} 
            href={`/${lang}/admin/books`}
            className={styles.drawerListItem}
          >
            <ListItemText primary="Admin" />
          </ListItem>
        )}
        
        {isAuthenticated && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem 
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              className={styles.drawerListItem}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemText primary={t.logout || 'Logout'} />
            </ListItem>
          </>
        )}
        
        <Divider sx={{ my: 1 }} />
        
        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1, px: 2 }}>
          {t.language}
        </Typography>
        {languages.map((lang) => (
          <ListItem 
            key={lang.code}
            className={`${styles.drawerLanguageItem} ${locale === lang.code ? styles.activeLanguage : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              changeLocale(lang.code);
            }}
          >
            <ListItemText primary={lang.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const locale = lang;

  return (
    <>
      <AppBar component="nav" position="sticky" color="default" elevation={1} className={styles.appBar}>
        <Toolbar className={styles.toolbar}>
        
          <Link href={`/${lang}`} className={styles.logo}>
            <LocalLibraryIcon className={styles.logoIcon} />
            <Typography variant="h6">
              {t.appName}
            </Typography>
          </Link>

          {renderDesktopNav()}

          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerToggle}
            className={styles.mobileMenuButton}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleLanguageMenuClose}
      >
        {languages.map((lang) => (
          <MenuItem 
            key={lang.code} 
            onClick={() => changeLocale(lang.code)}
            selected={locale === lang.code}
          >
            {lang.name}
          </MenuItem>
        ))}
      </Menu>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
      >
        {renderDrawerContent()}
      </Drawer>
    </>
  );
}