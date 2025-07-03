"use client"

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const message = searchParams?.get('message')

  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case 'missing-config':
        return 'Authentication is not properly configured. Please contact support.'
      case 'exchange-failed':
        return 'Failed to complete authentication. Please try signing in again.'
      case 'callback-failed':
        return 'Authentication callback failed. Please try again.'
      default:
        return 'An authentication error occurred. Please try again.'
    }
  }

  return (
    <div className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 text-center">
      <div className="flex justify-center mb-6">
        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Authentication Error
      </h1>
      
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        {getErrorMessage(message)}
      </p>
      
      <div className="space-y-3">
        <Link href="/" className="block">
          <Button className="w-full">
            Return to Home
          </Button>
        </Link>
        
        <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    </div>
  )
}

function AuthErrorFallback() {
  return (
    <div className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 text-center">
      <div className="flex justify-center mb-6">
        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Authentication Error
      </h1>
      
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        An authentication error occurred. Please try again.
      </p>
      
      <div className="space-y-3">
        <Link href="/" className="block">
          <Button className="w-full">
            Return to Home
          </Button>
        </Link>
        
        <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    </div>
  )
}

export default function AuthError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/30 flex items-center justify-center p-4">
      <Suspense fallback={<AuthErrorFallback />}>
        <AuthErrorContent />
      </Suspense>
    </div>
  )
}
