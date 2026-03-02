import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:8080';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get auth info
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

    const { id } = await params;
    const body = await request.json();
    
    const userId = authData.user?.id || authData.userId;
    const username = authData.user?.username || authData.username;
    const bookId = id;

    // Call the borrowing service
    const response = await fetch(`${GATEWAY_URL}/api/borrow/borrow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, username, bookId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Failed to borrow book' },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error borrowing book:', error);
    return NextResponse.json({ error: 'Failed to borrow book' }, { status: 500 });
  }
}
