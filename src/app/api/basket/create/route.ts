import { NextRequest, NextResponse } from 'next/server';

// Server environment variables
const TEBEX_BASE_URL = "https://headless.tebex.io/api";
const PUBLIC_TOKEN = process.env.NEXT_PUBLIC_TEBEX_PUBLIC_TOKEN;
const PRIVATE_TOKEN = process.env.TEBEX_PRIVATE_TOKEN?.trim();

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const { completeUrl, cancelUrl } = await req.json();
    
    if (!completeUrl || !cancelUrl) {
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
    
    // Create request body
    const requestBody = {
      complete_url: completeUrl,
      cancel_url: cancelUrl,
      complete_auto_redirect: true,
      custom: ["Server-side basket creation"],
    };
    
    console.log('[Server] Creating basket with:', { 
      urls: { completeUrl, cancelUrl }
    });
    
    // Make the API request to Tebex
    const response = await fetch(`${TEBEX_BASE_URL}/accounts/${PUBLIC_TOKEN}/baskets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Tebex-Secret': PRIVATE_TOKEN,
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('[Server] Tebex response status:', response.status);
    
    // Handle error response
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Server] Tebex API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Tebex API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }
    
    // Parse successful response
    const responseData = await response.json();
    console.log('[Server] Basket creation response data:', responseData);
    
    // Extract the basket ident from the response
    if (!responseData.data || !responseData.data.ident) {
      console.error('[Server] Invalid response format from Tebex API:', responseData);
      return NextResponse.json(
        { error: 'Invalid response format from Tebex API' },
        { status: 500 }
      );
    }
    
    // Return the basket ident in a consistent format
    const basketIdent = responseData.data.ident;
    console.log('[Server] Basket created successfully with ident:', basketIdent);
    
    return NextResponse.json({ ident: basketIdent });
    
  } catch (error) {
    console.error('[Server] Basket creation error:', error);
    return NextResponse.json(
      { error: 'Server error creating basket' },
      { status: 500 }
    );
  }
} 