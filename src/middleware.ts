import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Extremely basic in-memory rate limiter for Edge Runtime
// Note: In Vercel, this resets per edge instance cold start. 
// For production, a Redis solution like @upstash/ratelimit is recommended.
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // Max 30 requests per minute per IP

export function middleware(request: NextRequest) {
  // Only apply rate limiting to /api/ routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    
    // Attempt to get IP address
    const ip = request.ip ?? 
               request.headers.get('x-real-ip') ?? 
               request.headers.get('x-forwarded-for') ?? 
               'anonymous';
               
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;
    
    const record = rateLimitMap.get(ip);
    
    if (record) {
      if (record.timestamp < windowStart) {
        // Reset window
        rateLimitMap.set(ip, { count: 1, timestamp: now });
      } else {
        // Increment
        record.count++;
        if (record.count > MAX_REQUESTS_PER_WINDOW) {
          // Rate limit exceeded
          return new NextResponse(
            JSON.stringify({ error: 'Too many requests, please try again later.' }), 
            { status: 429, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    } else {
      // First request
      rateLimitMap.set(ip, { count: 1, timestamp: now });
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
