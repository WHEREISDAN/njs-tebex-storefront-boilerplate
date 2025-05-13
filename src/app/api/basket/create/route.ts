import { NextRequest, NextResponse } from 'next/server';
import { URL } from 'url';

// Server environment variables
const TEBEX_BASE_URL = "https://headless.tebex.io/api";
const PUBLIC_TOKEN = process.env.NEXT_PUBLIC_TEBEX_PUBLIC_TOKEN;
const PRIVATE_TOKEN = process.env.TEBEX_PRIVATE_TOKEN?.trim();

// List of allowed domains for redirect URLs
const ALLOWED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'yourproductiondomain.com', // Replace with your actual domain
];

// Function to validate a URL
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname;
    return ALLOWED_DOMAINS.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch (error) {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const { completeUrl, cancelUrl } = await req.json();
    
    // Validate URLs
    if (!completeUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Verify URLs point to allowed domains
    if (!isValidUrl(completeUrl) || !isValidUrl(cancelUrl)) {
      return NextResponse.json(
        { error: 'Invalid URL provided. Complete and cancel URLs must point to allowed domains.' },
        { status: 403 }
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
      custom: ["Server-side basket creation"]
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
        { error: `Tebex API error: ${response.status}` },
        { status: response.status }
      );
    }
    
    // Parse successful response
    const responseData = await response.json();
    console.log('[Server] Basket creation response data:', responseData);
    
    if (responseData.data && responseData.data.ident) {
      // Extract the basket ident from the response
      const basketIdent = responseData.data.ident;
      console.log('[Server] Basket created successfully with ident:', basketIdent);
      return NextResponse.json({ ident: basketIdent });
    } else {
      return NextResponse.json(
        { error: 'Invalid basket response: Missing ident in data object' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('[Server] Error creating basket:', error);
    return NextResponse.json(
      { error: 'Server error creating basket' },
      { status: 500 }
    );
  }
} 