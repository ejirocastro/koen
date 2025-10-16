/**
 * Stacks API Proxy with Caching
 *
 * This proxy route:
 * 1. Prevents CORS issues by proxying requests through Next.js backend
 * 2. Implements caching to reduce API calls to Hiro
 * 3. Handles rate limiting gracefully
 */

import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 120000; // 2 minutes cache (increased to reduce API calls)

// Rate limiting: track requests per minute
const rateLimitMap = new Map<string, number[]>();
const MAX_REQUESTS_PER_MINUTE = 100; // Increased to handle batch queries

/**
 * Check if request should be rate limited
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const requests = rateLimitMap.get(ip) || [];

  // Remove requests older than 1 minute
  const recentRequests = requests.filter(time => now - time < 60000);

  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    return true;
  }

  // Add current request
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);

  return false;
}

/**
 * Get from cache if available and not expired
 */
function getFromCache(key: string): any | null {
  const cached = cache.get(key);

  if (!cached) {
    return null;
  }

  const age = Date.now() - cached.timestamp;

  if (age > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  console.log(`[Proxy] Cache HIT for ${key} (age: ${age}ms)`);
  return cached.data;
}

/**
 * Save to cache
 */
function saveToCache(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });

  // Limit cache size to 100 entries
  if (cache.size > 100) {
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) {
      cache.delete(firstKey);
    }
  }
}

/**
 * POST /api/stacks-proxy
 * Proxy Stacks API calls with caching
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, method = 'POST', data } = body;

    // Validate request
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Only allow Hiro API endpoints
    if (!url.includes('api.testnet.hiro.so') && !url.includes('api.hiro.so')) {
      return NextResponse.json(
        { error: 'Only Hiro API endpoints are allowed' },
        { status: 403 }
      );
    }

    // Rate limiting check
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(clientIp)) {
      console.log(`[Proxy] Rate limited: ${clientIp}`);
      return NextResponse.json(
        { error: 'Too many requests, please slow down' },
        { status: 429 }
      );
    }

    // Create cache key from URL + data
    const cacheKey = `${url}:${JSON.stringify(data || {})}`;

    // Check cache first
    const cachedResponse = getFromCache(cacheKey);
    if (cachedResponse) {
      return NextResponse.json({
        ...cachedResponse,
        cached: true,
      });
    }

    // Make actual request to Hiro API
    console.log(`[Proxy] Forwarding request to: ${url}`);

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Proxy] API error: ${response.status} - ${errorText}`);

      return NextResponse.json(
        { error: `API request failed: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const responseData = await response.json();

    // Cache successful responses
    saveToCache(cacheKey, responseData);

    return NextResponse.json({
      ...responseData,
      cached: false,
    });

  } catch (error: any) {
    console.error('[Proxy] Error:', error);

    return NextResponse.json(
      { error: 'Proxy error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stacks-proxy/stats
 * Get cache statistics
 */
export async function GET() {
  const stats = {
    cacheSize: cache.size,
    cacheTTL: CACHE_TTL,
    maxCacheSize: 100,
    rateLimit: MAX_REQUESTS_PER_MINUTE,
    activeRateLimits: rateLimitMap.size,
  };

  return NextResponse.json(stats);
}
