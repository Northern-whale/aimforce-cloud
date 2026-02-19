import { NextRequest, NextResponse } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export interface RateLimitConfig {
  interval: number // Time window in milliseconds
  maxRequests: number // Max requests per interval
}

const DEFAULT_CONFIG: RateLimitConfig = {
  interval: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
}

/**
 * Simple in-memory rate limiter
 * For production, use Redis or Upstash
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now()
  const key = identifier

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    // 1% chance
    Object.keys(store).forEach((k) => {
      if (store[k].resetTime < now) {
        delete store[k]
      }
    })
  }

  if (!store[key] || store[key].resetTime < now) {
    // First request or window expired
    store[key] = {
      count: 1,
      resetTime: now + config.interval,
    }
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: store[key].resetTime,
    }
  }

  store[key].count++

  const success = store[key].count <= config.maxRequests

  return {
    success,
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - store[key].count),
    reset: store[key].resetTime,
  }
}

/**
 * Rate limit middleware for API routes
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config?: RateLimitConfig
) {
  return async (req: NextRequest) => {
    // Get identifier (IP address or user ID)
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const identifier = `ip:${ip}`

    const result = rateLimit(identifier, config)

    // Add rate limit headers
    const headers = {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.reset).toISOString(),
    }

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            ...headers,
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    const response = await handler(req)

    // Add rate limit headers to successful response
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }
}

/**
 * Get rate limit status for an identifier
 */
export function getRateLimitStatus(identifier: string, config: RateLimitConfig = DEFAULT_CONFIG) {
  const now = Date.now()
  const entry = store[identifier]

  if (!entry || entry.resetTime < now) {
    return {
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: now + config.interval,
    }
  }

  return {
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - entry.count),
    reset: entry.resetTime,
  }
}
