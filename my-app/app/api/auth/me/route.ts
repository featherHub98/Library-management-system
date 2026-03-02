import { NextRequest, NextResponse } from 'next/server';

function decodeRoleFromToken(token: string | undefined): 'admin' | 'public' | null {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const payloadBase64 = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const padded = payloadBase64 + '='.repeat((4 - (payloadBase64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as { role?: string; id?: string; username?: string };

    return (payload.role === 'admin' || payload.role === 'public') ? (payload.role as 'admin' | 'public') : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('authToken')?.value;
    const role = decodeRoleFromToken(token);

    if (!token || !role) {
      return NextResponse.json({ isAuthenticated: false }, { status: 200 });
    }

    return NextResponse.json(
      {
        isAuthenticated: true,
        role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking auth:', error);
    return NextResponse.json(
      { isAuthenticated: false },
      { status: 200 }
    );
  }
}
