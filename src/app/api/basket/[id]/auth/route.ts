import { NextRequest, NextResponse } from 'next/server';
import { URL } from 'url';

// Server environment variables
const TEBEX_BASE_URL = "https://headless.tebex.io/api";
const PUBLIC_TOKEN = process.env.NEXT_PUBLIC_TEBEX_PUBLIC_TOKEN;
const PRIVATE_TOKEN = process.env.TEBEX_PRIVATE_TOKEN?.trim();

// List of allowed domains for return URLs
const ALLOWED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'yourproductiondomain.com', // Replace with your actual domain
];

// Function to validate return URL
function isValidReturnUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname;
    return ALLOWED_DOMAINS.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch (error) {
    return false;
  }
}

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Ensure params is awaited properly
    const params = await context.params;
    const basketIdent = params.id;
    
    // Get return URL from query parameters
    const returnUrl = req.nextUrl.searchParams.get('returnUrl');
    
    if (!basketIdent) {
      return NextResponse.json(
        { error: 'Missing basket identifier' },
        { status: 400 }
      );
    }
    
    if (!returnUrl) {
      return NextResponse.json(
        { error: 'Missing return URL' },
        { status: 400 }
      );
    }
    
    // Validate the return URL points to an allowed domain
    if (!isValidReturnUrl(returnUrl)) {
      return NextResponse.json(
        { error: 'Invalid return URL domain' },
        { status: 403 }
      );
    }
    
    if (!PRIVATE_TOKEN) {
      return NextResponse.json(
        { error: 'Server configuration error - missing private token' },
        { status: 500 }
      );
    }
    
    // Make the API request to Tebex
    const encodedReturnUrl = encodeURIComponent(returnUrl);
    const response = await fetch(`${TEBEX_BASE_URL}/accounts/${PUBLIC_TOKEN}/baskets/${basketIdent}/auth?returnUrl=${encodedReturnUrl}`, {
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
    
    // The auth endpoint returns an array of auth providers with their URL
    const authProviders = await response.json();
    
    // If there are auth providers, return the first one's URL
    if (Array.isArray(authProviders) && authProviders.length > 0) {
      return NextResponse.json({ auth_url: authProviders[0].url });
    }
    
    // If no auth providers are available, handle this case
    return NextResponse.json(
      { error: 'No authentication URL available for this basket' },
      { status: 404 }
    );
    
  } catch (error) {
    console.error('[Server] Error getting basket auth URL:', error);
    return NextResponse.json(
      { error: 'Server error getting basket auth URL' },
      { status: 500 }
    );
  }
} 