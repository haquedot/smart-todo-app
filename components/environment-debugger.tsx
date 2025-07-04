"use client"

import { useState } from 'react'

export function EnvironmentDebugger() {
  const [showDebug, setShowDebug] = useState(false)

  const envVars = {
    'NEXT_PUBLIC_SITE_URL': process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET',
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
    'Window Origin': typeof window !== 'undefined' ? window.location.origin : 'SERVER SIDE',
    'Is Development': process.env.NODE_ENV === 'development' ? 'Yes' : 'No',
    'User Agent': typeof window !== 'undefined' ? window.navigator.userAgent.substring(0, 50) + '...' : 'SERVER SIDE'
  }

  if (!showDebug) {
    return (
      <button 
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white px-3 py-1 rounded text-sm z-50"
      >
        Debug OAuth
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 overflow-auto">
        <h3 className="font-bold text-lg mb-4">Environment Debug Info</h3>
        
        <div className="space-y-2 text-sm">
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="font-medium">{key}:</span>
              <span className={`ml-2 ${value === 'NOT SET' ? 'text-red-600' : 'text-green-600'}`}>
                {value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
          <strong>Expected Redirect URL:</strong><br />
          {process.env.NEXT_PUBLIC_SITE_URL 
            ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
            : `${typeof window !== 'undefined' ? window.location.origin : 'UNKNOWN'}/auth/callback`
          }
        </div>

        <div className="mt-4 flex gap-2">
          <button 
            onClick={() => setShowDebug(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded text-sm"
          >
            Close
          </button>
          <button 
            onClick={() => {
              console.log('Environment Debug Info:', envVars)
              alert('Debug info logged to console')
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded text-sm"
          >
            Log to Console
          </button>
        </div>
      </div>
    </div>
  )
}
