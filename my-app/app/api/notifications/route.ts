import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    const authResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/me`, {
      headers: request.headers,
    });

    if (!authResponse.ok) {
      return NextResponse.json({ notifications: [], total: 0, unread: 0 });
    }

    const authData = await authResponse.json();
    if (!authData.isAuthenticated) {
      return NextResponse.json({ notifications: [], total: 0, unread: 0 });
    }

    const userId = authData.user?.id || authData.userId;
    if (!userId) {
      return NextResponse.json({ notifications: [], total: 0, unread: 0 });
    }

    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '20';

    const response = await fetch(`${GATEWAY_URL}/api/notifications/${userId}?page=${page}&limit=${limit}`);
    if (!response.ok) {
      return NextResponse.json({ notifications: [], total: 0, unread: 0 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ notifications: [], total: 0, unread: 0 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/me`, {
      headers: request.headers,
    });

    if (!authResponse.ok) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const authData = await authResponse.json();
    if (!authData.isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      const userId = authData.user?.id || authData.userId;
      const response = await fetch(`${GATEWAY_URL}/api/notifications/${userId}/read-all`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Failed to mark all as read');
      }
      const data = await response.json();
      return NextResponse.json(data);
    }

    if (notificationId) {
      const response = await fetch(`${GATEWAY_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }
      const data = await response.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
