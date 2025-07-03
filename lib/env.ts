/**
 * Checks if all required environment variables are present
 * Throws helpful error messages if any are missing
 */
export function validateEnvironmentVariables() {
  const requiredVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
    }
  }

  // Server-side: validate and return
  validateEnvironmentVariables()
  
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  }
}
