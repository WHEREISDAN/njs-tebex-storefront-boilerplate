import { NextRequest, NextResponse } from 'next/server';

// Server environment variables
const TEBEX_BASE_URL = "https://headless.tebex.io/api";
const PUBLIC_TOKEN = process.env.NEXT_PUBLIC_TEBEX_PUBLIC_TOKEN;
const PRIVATE_TOKEN = process.env.TEBEX_PRIVATE_TOKEN?.trim();

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Ensure params is awaited properly
    const params = await context.params;
    const basketIdent = params.id;
    
    // Parse request body
    const { packageId, quantity } = await req.json();
    
    if (!basketIdent || !packageId || typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json(
        { error: 'Missing or invalid required parameters' },
        { status: 400 }
      );
    }
    
    if (!PRIVATE_TOKEN) {
      return NextResponse.json(
        { error: 'Server configuration error - missing private token' },
        { status: 500 }
      );
    }
    
    // Make the API request to Tebex
    const response = await fetch(`${TEBEX_BASE_URL}/baskets/${basketIdent}/packages/${packageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Tebex-Secret': PRIVATE_TOKEN,
      },
      body: JSON.stringify({
        quantity: quantity,
      }),
    });
    
    // Handle error response
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Server] Tebex API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Tebex API error: ${response.status}` },
        { status: response.status }
      );
    }
    
    // This endpoint typically returns no content on success
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('[Server] Error updating basket item:', error);
    return NextResponse.json(
      { error: 'Server error updating basket item' },
      { status: 500 }
    );
  }
} 