import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  console.log('🔄 Auth callback received:', {
    code: code ? '✓ Present' : '✗ Missing',
    error: error || 'None',
    errorDescription: errorDescription || 'None',
    url: request.url,
    timestamp: new Date().toISOString()
  })

  // Check for OAuth errors first
  if (error) {
    console.error('❌ OAuth error in callback:', { error, errorDescription })
    return NextResponse.redirect(new URL(`/auth/error?message=${error}&description=${errorDescription}`, request.url))
  }

  // Check for required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables')
    return NextResponse.redirect(new URL('/auth/error?message=missing-config', request.url))
  }

  if (code) {
    try {
      // Create Supabase client for this request
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.error('Auth exchange error:', error)
        return NextResponse.redirect(new URL('/auth/error?message=exchange-failed', request.url))
      }
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/auth/error?message=callback-failed', request.url))
    }
  }

  // Redirect to home page after successful authentication
  return NextResponse.redirect(new URL('/', request.url))
}
