import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '12';

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('page', page);
    params.append('limit', limit);

    const response = await fetch(`${GATEWAY_URL}/api/authors?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch authors');
    }
    const authors = await response.json();
    return NextResponse.json(authors);
  } catch (error) {
    console.error('Error fetching authors:', error);
    return NextResponse.json({ error: 'Failed to fetch authors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const authResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/me`, {
      headers: request.headers,
    });

    if (!authResponse.ok) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const authData = await authResponse.json();

    // ADMIN-ONLY CHECK: Only admins can add authors
    if (!authData.isAuthenticated || authData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required. Only administrators can add authors.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    const response = await fetch(`${GATEWAY_URL}/api/authors`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create author');
    }

    const newAuthor = await response.json();
    return NextResponse.json(newAuthor, { status: 201 });
  } catch (error) {
    console.error('Error creating author:', error);
    return NextResponse.json({ error: 'Failed to create author' }, { status: 500 });
  }
}
