import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${GATEWAY_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const rawBody = await response.text();
    let data: Record<string, unknown> = {};

    if (rawBody) {
      try {
        data = JSON.parse(rawBody);
      } catch {
        data = { error: rawBody };
      }
    }

    if (!response.ok) {
      const errorPayload =
        data && typeof data === 'object'
          ? data
          : { error: 'Login failed' };
      return NextResponse.json(errorPayload, { status: response.status });
    }

    const res = NextResponse.json(data, { status: 200 });
    
    const token = typeof data.token === 'string' ? data.token : null;

    if (token) {
      res.cookies.set('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });
    }

    return res;
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
