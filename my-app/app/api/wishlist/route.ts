import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
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

    const userId = authData.user?.id || authData.userId;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }

    const response = await fetch(`${GATEWAY_URL}/api/wishlist/${userId}`);
    if (!response.ok) {
      return NextResponse.json({ items: [] });
    }

    const wishlist = await response.json();
    return NextResponse.json(wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const userId = authData.user?.id || authData.userId;
    const username = authData.user?.username || authData.username;
    const body = await request.json();
    const { bookId } = body;

    if (!bookId) {
      return NextResponse.json({ error: 'Book ID required' }, { status: 400 });
    }

    const response = await fetch(`${GATEWAY_URL}/api/wishlist/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, username, bookId }),
    });

    if (!response.ok) {
      throw new Error('Failed to add to wishlist');
    }

    const wishlist = await response.json();
    return NextResponse.json(wishlist);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    const userId = authData.user?.id || authData.userId;
    const body = await request.json();
    const { bookId } = body;

    if (!bookId) {
      return NextResponse.json({ error: 'Book ID required' }, { status: 400 });
    }

    const response = await fetch(`${GATEWAY_URL}/api/wishlist/${userId}/remove/${bookId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to remove from wishlist');
    }

    const wishlist = await response.json();
    return NextResponse.json(wishlist);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
