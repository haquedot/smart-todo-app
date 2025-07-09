/**
 * Checks if all required environment variables are present
 * Throws helpful error messages if any are missing
 */
export function validateEnvironmentVariables() {
  const requiredVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'NEXT_PUBLIC_SITE_URL': process.env.NEXT_PUBLIC_SITE_URL
  }

  const missingVars = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length > 0) {
    const errorMessage = `
Missing required environment variables:
${missingVars.map(v => `- ${v}`).join('\n')}

Please create a .env.local file in your project root with the following variables:
${missingVars.map(v => `${v}=your_value_here`).join('\n')}

See .env.example for reference and AUTH_SETUP.md for detailed setup instructions.
    `.trim()

    throw new Error(errorMessage)
  }

  return true
}

/**
 * Gets environment variables with fallbacks for development
 */
export function getEnvVars() {
  if (typeof window !== 'undefined') {
    // Client-side: environment variables should be available through Next.js
    return {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || ''
    }
  }

  // Server-side: validate and return
  validateEnvironmentVariables()
  
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL!
  }
}

/**
 * Get the site URL for redirects, with proper fallbacks
 */
export function getSiteUrl(): string {
  // First try the environment variable
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (envSiteUrl) {
    return envSiteUrl
  }

  // Fallback to window origin for client-side
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // Server-side fallback (shouldn't normally reach here in production)
  return 'http://localhost:3000'
}
