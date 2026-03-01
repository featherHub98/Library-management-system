import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(`${GATEWAY_URL}/api/authors/${id}/cv`);

    if (!response.ok) {
      throw new Error('Failed to download CV');
    }

    const contentType = response.headers.get('content-type') || 'application/pdf';
    const contentDisposition = response.headers.get('content-disposition');

    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition || 'attachment; filename="author_cv.pdf"',
      },
    });
  } catch (error) {
    console.error('Error downloading CV:', error);
    return NextResponse.json({ error: 'Failed to download CV' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();

    const response = await fetch(`${GATEWAY_URL}/api/authors/${id}/cv`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload CV');
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error uploading CV:', error);
    return NextResponse.json({ error: 'Failed to upload CV' }, { status: 500 });
  }
}
