import { NextResponse, NextRequest } from 'next/server';
import { csrfProtection } from './lib/csrf';

// Paths that should be protected by CSRF
const CSRF_PROTECTED_PATHS = [
  '/api/basket/create',
  '/api/basket/*/add',
  '/api/basket/*/update',
  '/api/basket/*/remove',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if this is an API route that needs CSRF protection
  const needsCsrfProtection = CSRF_PROTECTED_PATHS.some(path => {
    // Convert path pattern to regex
    const pattern = path
      .replace(/\//g, '\\/') // Escape slashes
      .replace(/\*/g, '[^\\/]+'); // Replace * with any character except /
    
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname);
  });
  
  // Only apply CSRF protection in production or if enforced in development
  const isProduction = process.env.NODE_ENV === 'production';
  const enforceCsrfInDev = process.env.ENFORCE_CSRF_IN_DEV === 'true';
  
  if (needsCsrfProtection && (isProduction || enforceCsrfInDev)) {
    // Apply CSRF protection
    const csrfResult = csrfProtection(request);
    
    // If the CSRF protection returns a response, use it
    // (this will be a 403 error if validation fails)
    if (csrfResult) {
      console.log(`[CSRF] Protection triggered for ${pathname}`);
      return csrfResult;
    }
  } else if (needsCsrfProtection) {
    console.log(`[CSRF] Protection bypassed for ${pathname} in development mode`);
  }
  
  // Continue with the request
  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    '/api/basket/:path*',
  ],
}; 