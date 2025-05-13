import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

// CSRF token cookie name
const CSRF_TOKEN_COOKIE = 'csrf_token';
// Cookie options
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60, // 1 hour
};

export async function GET(req: NextRequest) {
  try {
    // Generate a new token
    const token = nanoid(32);
    
    // Create response with token in both body and cookie
    const response = new NextResponse(
      JSON.stringify({ token }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
        }
      }
    );
    
    // Set the token in a cookie
    response.cookies.set(CSRF_TOKEN_COOKIE, token, COOKIE_OPTIONS);
    
    // Log that we're setting the token (for debugging)
    console.log('[CSRF] Generated new token');
    
    // Return the response
    return response;
  } catch (error) {
    console.error('[Server] Error generating CSRF token:', error);
    return NextResponse.json(
      { error: 'Server error generating CSRF token' },
      { status: 500 }
    );
  }
} 