import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';

// CSRF token cookie name
const CSRF_TOKEN_COOKIE = 'csrf_token';
// CSRF token header name
const CSRF_TOKEN_HEADER = 'X-CSRF-Token';
// Cookie options
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60, // 1 hour
};

/**
 * Generate a new CSRF token and set it in the response headers
 */
export function generateCsrfToken(res: NextResponse): string {
  // Generate a new token
  const token = nanoid(32);
  
  // Set the token in a cookie on the response
  res.cookies.set(CSRF_TOKEN_COOKIE, token, COOKIE_OPTIONS);
  
  return token;
}

/**
 * Middleware function to add CSRF protection to API routes
 * This validates tokens for state-changing methods and generates tokens for GET requests
 */
export function csrfProtection(req: NextRequest): NextResponse | null {
  // Only protect state-changing methods
  const method = req.method.toUpperCase();
  
  if (method === 'GET') {
    // For GET requests, we just generate a new token
    const res = NextResponse.next();
    generateCsrfToken(res);
    return res;
  }
  
  if (method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'PATCH') {
    // For state-changing methods, validate the token
    const csrfTokenFromCookie = req.cookies.get(CSRF_TOKEN_COOKIE)?.value;
    const csrfTokenFromHeader = req.headers.get(CSRF_TOKEN_HEADER);
    
    if (!csrfTokenFromCookie || !csrfTokenFromHeader || csrfTokenFromCookie !== csrfTokenFromHeader) {
      // Invalid CSRF token
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }
    
    // Token is valid, proceed with the request
    return null;
  }
  
  // For other methods, just proceed
  return null;
}

/**
 * Get the CSRF token from a request
 */
export function getCsrfTokenFromRequest(req: NextRequest): string | undefined {
  return req.cookies.get(CSRF_TOKEN_COOKIE)?.value;
}

/**
 * Get the name of the CSRF token header
 */
export function getCsrfTokenHeaderName(): string {
  return CSRF_TOKEN_HEADER;
} 