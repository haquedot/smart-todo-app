/**
 * Configuration management for the Smart Todo App
 * Handles environment variables and provides fallbacks
 */

export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL || (
      typeof window !== 'undefined' 
        ? window.location.origin 
        : 'http://localhost:3000'
    ),
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
} as const

/**
 * Get the correct site URL for OAuth redirects
 */
export function getSiteUrl(): string {
  // If we're in development (localhost), use localhost
  if (typeof window !== 'undefined' && 
      (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1'))) {
    return window.location.origin
  }
  
  // For production, use the environment variable
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  
  // Fallback to window origin for client-side
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // Server-side fallback
  return 'http://localhost:3000'
}

/**
 * Get the OAuth redirect URL
 */
export function getAuthCallbackUrl(): string {
  return `${getSiteUrl()}/auth/callback`
}

/**
 * Validate that all required environment variables are present
 */
export function validateConfig() {
  const required = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    const error = `Missing required environment variables: ${missing.join(', ')}`
    console.error(error)
    throw new Error(error)
  }

  // Warn about missing optional variables
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    console.warn('⚠️ NEXT_PUBLIC_SITE_URL not set. OAuth redirects may fail in production.')
  }

  return true
}
