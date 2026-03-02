import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(`${GATEWAY_URL}/api/books/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch book');
    }
    const book = await response.json();
    return NextResponse.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }) {
  const contentType = request.headers.get('content-type') || '';
  
  if (contentType.includes('multipart/form-data')) {
    // Handle FormData (with image upload)
    const formData = await request.formData();
    response = await fetch(`${GATEWAY_URL}/api/books/${id}`, {
      method: 'PUT',
      body: formData,  // Send as FormData
    });
  } else {
    // Handle JSON
    const body = await request.json();
    response = await fetch(`${GATEWAY_URL}/api/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await fetch(`${GATEWAY_URL}/api/books/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete book');
    }

    return NextResponse.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
  }
}
