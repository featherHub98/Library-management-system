import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(`${GATEWAY_URL}/api/authors/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch author');
    }

    const author = await response.json();
    return NextResponse.json(author);
  } catch (error) {
    console.error('Error fetching author:', error);
    return NextResponse.json({ error: 'Failed to fetch author' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const response = await fetch(`${GATEWAY_URL}/api/authors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update author');
    }

    const updatedAuthor = await response.json();
    return NextResponse.json(updatedAuthor);
  } catch (error) {
    console.error('Error updating author:', error);
    return NextResponse.json({ error: 'Failed to update author' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(`${GATEWAY_URL}/api/authors/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete author');
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting author:', error);
    return NextResponse.json({ error: 'Failed to delete author' }, { status: 500 });
  }
}
