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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get the current book state to check if status is changing
    const currentBookResponse = await fetch(`${GATEWAY_URL}/api/books/${id}`);
    const currentBook = currentBookResponse.ok ? await currentBookResponse.json() : null;

    // Check content type to determine how to handle the body
    const contentType = request.headers.get('content-type') || '';
    
    let response: Response;
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (with image upload)
      const formData = await request.formData();
      
      response = await fetch(`${GATEWAY_URL}/api/books/${id}`, {
        method: 'PUT',
        body: formData,
      });
    } else {
      // Handle JSON
      const body = await request.json();
      
      response = await fetch(`${GATEWAY_URL}/api/books/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update book');
    }

    const updatedBook = await response.json();

    // If book was out of stock and is now in stock, notify wishlisted users
    if (currentBook && currentBook.status === 'out_of_stock' && updatedBook.status === 'in_stock') {
      try {
        await fetch(`${GATEWAY_URL}/api/books/${id}/notify-available`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookTitle: updatedBook.title }),
        });
      } catch (notifyError) {
        console.error('Failed to send availability notifications:', notifyError);
      }
    }

    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json({ error: 'Failed to update book' }, { status: 500 });
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

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
  }
}
