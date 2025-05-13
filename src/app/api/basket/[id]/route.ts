import { NextRequest, NextResponse } from 'next/server';

// Server environment variables
const TEBEX_BASE_URL = "https://headless.tebex.io/api";
const PUBLIC_TOKEN = process.env.NEXT_PUBLIC_TEBEX_PUBLIC_TOKEN;
const PRIVATE_TOKEN = process.env.TEBEX_PRIVATE_TOKEN?.trim();

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Ensure params is awaited properly
    const params = await context.params;
    const basketIdent = params.id;
    
    if (!basketIdent) {
      return NextResponse.json(
        { error: 'Missing basket identifier' },
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
    const response = await fetch(`${TEBEX_BASE_URL}/accounts/${PUBLIC_TOKEN}/baskets/${basketIdent}`, {
      headers: {
        'Accept': 'application/json',
        'X-Tebex-Secret': PRIVATE_TOKEN,
      },
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
    
    // Return only the data portion of the response
    if (responseData && responseData.data) {
      return NextResponse.json({ data: responseData.data });
    } else {
      return NextResponse.json(
        { error: 'Invalid response format from Tebex API' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('[Server] Error fetching basket:', error);
    return NextResponse.json(
      { error: 'Server error fetching basket' },
      { status: 500 }
    );
  }
} 