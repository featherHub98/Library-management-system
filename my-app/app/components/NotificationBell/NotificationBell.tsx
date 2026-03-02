'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  IconButton, Badge, Menu, MenuItem, Box, Typography, List, ListItem,
  ListItemText, ListItemIcon, Divider, Button, Paper, Chip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Book as BookIcon,
  Event as EventIcon,
  NewReleases as NewReleasesIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import en from '@/dictionaries/en.json';
import fr from '@/dictionaries/fr.json';
import ar from '@/dictionaries/ar.json';

const dictionaries = { en, fr, ar };

interface Notification {
  id: string;
  userId: string;
  type: 'book_available' | 'due_reminder' | 'overdue' | 'new_release' | 'reservation_ready' | 'general';
  title: string;
  message: string;
  bookId?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationBellProps {
  isAuthenticated: boolean;
}

export default function NotificationBell({ isAuthenticated }: NotificationBellProps) {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || 'en';
  const t = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;
  const text = (key: string, fallback: string) => {
    const value = (t as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : fallback;
  };

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      pollingRef.current = setInterval(fetchNotifications, 30000);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await fetch('/api/notifications?limit=10');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    if (notification.bookId) {
      router.push(`/${lang}/books?id=${notification.bookId}`);
    }
    handleClose();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'book_available':
        return <CheckCircleIcon color="success" />;
      case 'due_reminder':
        return <EventIcon color="warning" />;
      case 'overdue':
        return <WarningIcon color="error" />;
      case 'new_release':
        return <NewReleasesIcon color="info" />;
      case 'reservation_ready':
        return <BookIcon color="primary" />;
      default:
        return <NotificationsIcon color="action" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleOpen}
        aria-label={`${unreadCount} unread notifications`}
      >
        <Badge badgeContent={unreadCount > 99 ? '99+' : unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 500,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {text('notifications', 'Notifications')}
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />

        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">
              {text('noNotifications', 'No notifications yet')}
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.slice(0, 10).map((notification) => (
              <ListItem
                key={notification.id}
                alignItems="flex-start"
                sx={{
                  cursor: 'pointer',
                  bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' },
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: notification.isRead ? 'normal' : 'bold' }}
                      >
                        {notification.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimeAgo(notification.createdAt)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {notification.message}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}

        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button
                size="small"
                onClick={() => {
                  handleClose();
                  router.push(`/${lang}/notifications`);
                }}
              >
                View All Notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
}
