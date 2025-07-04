# Authentication Setup Guide

This guide will help you set up Supabase authentication with Google OAuth for your Smart Todo app.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Google Cloud Console project for OAuth (https://console.cloud.google.com)

## Step 1: Set up Supabase Project

1. Go to https://supabase.com and create a new project
2. Wait for the project to be fully initialized
3. Go to Settings → API to find your project URL and anon key
4. Update your `.env.local` file with these values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
   ```

## Step 2: Set up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql` into the editor
4. Run the SQL to create the todos table and set up Row Level Security

## Step 3: Configure Google OAuth

1. Go to the Google Cloud Console (https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to APIs & Services → Library
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth client ID"
   - Select "Web application"
   - Add authorized redirect URIs:
     - `https://rvynhgxdjikninyszkmq.supabase.co/auth/v1/callback` (production)
     - `http://localhost:3000/auth/callback` (for development - only if testing locally)
   - Copy the Client ID and Client Secret

**Important**: In production, remove the localhost redirect URI for security.

## Step 4: Configure Supabase Auth

1. In your Supabase project, go to Authentication → Providers
2. Find Google and click to configure
3. Enable Google provider
4. Add your Google OAuth Client ID and Client Secret
5. Set the redirect URL to: `https://rvynhgxdjikninyszkmq.supabase.co/auth/v1/callback`

## Step 5: Test Authentication

1. Start your development server: `npm run dev`
2. Open your app in the browser
3. Click "Sign In" to test Google authentication
4. After successful login, your tasks should automatically sync with Supabase

## Step 6: Production Deployment

When deploying to production (Vercel, Netlify, etc.):

1. **Set up environment variables** in your deployment platform:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://rvynhgxdjikninyszkmq.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
   GEMINI_API_KEY=your_gemini_api_key
   ```

2. **Update Google OAuth settings**:
   - Go to Google Cloud Console → APIs & Services → Credentials
   - Edit your OAuth client ID
   - Update authorized redirect URIs to include your production domain:
     - `https://rvynhgxdjikninyszkmq.supabase.co/auth/v1/callback`
   - Remove localhost URLs for security

3. **Verify Supabase settings**:
   - In Supabase Authentication → Providers → Google
   - Ensure the redirect URL matches: `https://rvynhgxdjikninyszkmq.supabase.co/auth/v1/callback`

**Important**: The `NEXT_PUBLIC_SITE_URL` environment variable ensures that OAuth redirects work correctly in production.

## Features

- **Guest Mode**: Users can use the app without signing in (data stored locally)
- **Account Creation**: Users can sign in with Google anytime
- **Data Migration**: Local tasks are automatically synced to the cloud when users sign in
- **Real-time Sync**: Manual sync button available for authenticated users
- **Offline First**: App works offline, syncs when connection is restored

## Security Notes

- Row Level Security (RLS) is enabled to ensure users can only access their own tasks
- Authentication is handled entirely by Supabase
- Local storage is used as a backup and for offline functionality

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**: Make sure you've added both production and development URLs to your Google OAuth configuration
2. **"Unauthorized"**: Check that your Supabase URL and anon key are correct
3. **Sync failing**: Ensure the database schema has been applied correctly
4. **"User not found"**: Make sure RLS policies are set up correctly

### Development vs Production

- Development URL: `http://localhost:3000/auth/callback`
- Production URL: `https://your-domain.com/auth/callback`

Make sure to update your Google OAuth settings when deploying to production.
