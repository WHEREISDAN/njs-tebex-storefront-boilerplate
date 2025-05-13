import { NextRequest, NextResponse } from 'next/server';

// Server environment variables
const TEBEX_BASE_URL = "https://headless.tebex.io/api";
const PUBLIC_TOKEN = process.env.NEXT_PUBLIC_TEBEX_PUBLIC_TOKEN;
const PRIVATE_TOKEN = process.env.TEBEX_PRIVATE_TOKEN?.trim();

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Ensure params is awaited properly
    const params = await context.params;
    const basketIdent = params.id;
    
    // Parse request body
    const { packageId } = await req.json();
    
    if (!basketIdent || !packageId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
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
    const response = await fetch(`${TEBEX_BASE_URL}/baskets/${basketIdent}/packages/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Tebex-Secret': PRIVATE_TOKEN,
      },
      body: JSON.stringify({
        package_id: packageId,
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
    
    // Parse successful response
    const responseData = await response.json();
    
    return NextResponse.json({ success: true, data: responseData });
    
  } catch (error) {
    console.error('[Server] Error removing item from basket:', error);
    return NextResponse.json(
      { error: 'Server error removing item from basket' },
      { status: 500 }
    );
  }
} 