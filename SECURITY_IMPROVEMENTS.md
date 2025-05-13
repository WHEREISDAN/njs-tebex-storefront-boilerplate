# Security Improvements for Tebex Storefront Boilerplate

This document summarizes the security improvements made to the Next.js Tebex Storefront Boilerplate application.

## 1. Moved Private API Calls to Server-side Only

### Issue
Previously, the application was using the private Tebex API token directly in client-side code, which could expose it to attackers.

### Solution
- Created dedicated server-side API routes in `/api/basket/` to handle all operations requiring the private token
- Removed all client-side references to `TEBEX_PRIVATE_TOKEN`
- Updated client-side code to call these API routes instead of the Tebex API directly
- New endpoints:
  - `/api/basket/[id]` - Get basket details
  - `/api/basket/create` - Create a new basket
  - `/api/basket/[id]/add` - Add items to basket
  - `/api/basket/[id]/update` - Update basket item quantity
  - `/api/basket/[id]/remove` - Remove items from basket
  - `/api/basket/[id]/auth` - Get authentication URL

## 2. Restricted CORS Policy

### Issue
The application was using a wildcard (`*`) for CORS, which allows any site to make requests to the API.

### Solution
- Updated `next.config.ts` to specify allowed origins instead of using a wildcard
- Kept wildcard for development mode only to ease local development
- Added specific allowed domains for production environments

## 3. Implemented URL Validation

### Issue
The application was not validating URLs used for redirects, which could lead to open redirect vulnerabilities.

### Solution
- Added a domain allowlist for redirect URLs
- Implemented URL validation functions to check URLs before using them
- Added client-side URL validation before sending to server
- Added server-side URL validation as a second layer of defense

## 4. Added CSRF Protection

### Issue
The application lacked Cross-Site Request Forgery (CSRF) protection, which could allow attackers to perform actions on behalf of authenticated users.

### Solution
- Created CSRF token generation and validation utilities
- Implemented middleware to apply CSRF protection to state-changing API routes
- Added client-side code to include CSRF tokens in all state-changing requests
- Created a dedicated endpoint to provide CSRF tokens to the client

## 5. Input Validation

### Issue
The application had minimal input validation, which could lead to injection attacks or unexpected behavior.

### Solution
- Added comprehensive validation for all input parameters
- Implemented strict type checking for request parameters
- Added error handling for missing or invalid parameters

## 6. Enhanced Error Handling

### Issue
The application had inconsistent error handling, which could expose sensitive information.

### Solution
- Standardized error responses across all API endpoints
- Improved error logging for debugging purposes
- Ensured error responses don't expose sensitive information or stack traces

## Next Steps

- Consider implementing rate limiting to prevent abuse
- Add additional logging for security events
- Consider implementing content security policy (CSP) headers
- Regularly update dependencies to address security vulnerabilities

## Development Notes

- When adding new features that require server-side API calls, create a new API route rather than using the private token in client-side code
- Always validate user input, especially URLs and other potentially dangerous parameters
- Use the CSRF protection system for all state-changing operations 