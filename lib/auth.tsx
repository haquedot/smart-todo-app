"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    // Get the correct redirect URL based on environment
    const getRedirectUrl = () => {
      // Check for environment variable override (required for production)
      const envRedirectUrl = process.env.NEXT_PUBLIC_SITE_URL
      if (envRedirectUrl) {
        return `${envRedirectUrl}/auth/callback`
      }
      
      // Fallback to current origin (works for development)
      if (typeof window !== 'undefined') {
        const currentOrigin = window.location.origin
        // Warn if we're likely in production but no NEXT_PUBLIC_SITE_URL is set
        if (!currentOrigin.includes('localhost') && !currentOrigin.includes('127.0.0.1')) {
          console.warn(
            '⚠️ NEXT_PUBLIC_SITE_URL not set for production deployment. ' +
            'OAuth redirects may fail. See PRODUCTION_DEPLOY.md for setup instructions.'
          )
        }
        return `${currentOrigin}/auth/callback`
      }
      
      // Last fallback
      return '/auth/callback'
    }

    const redirectUrl = getRedirectUrl()
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    })
    if (error) {
      console.error('Error signing in with Google:', error)
      // Provide helpful error message for common redirect URI issues
      if (error.message?.includes('redirect') || error.message?.includes('URI')) {
        console.error(
          'This might be a redirect URI configuration issue. ' +
          'Check that NEXT_PUBLIC_SITE_URL is set correctly and ' +
          'your Google OAuth settings match. See PRODUCTION_DEPLOY.md'
        )
      }
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signInWithGoogle,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
