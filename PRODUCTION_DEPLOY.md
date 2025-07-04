# Production Deployment Checklist

This checklist ensures your Smart Todo app works correctly in production with Google OAuth authentication.

## Pre-Deployment Checklist

### 1. Environment Variables
Set these environment variables in your deployment platform (Vercel, Netlify, etc.):

```bash
# Required for Supabase connection
NEXT_PUBLIC_SUPABASE_URL=https://rvynhgxdjikninyszkmq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Required for AI explanations
GEMINI_API_KEY=your_gemini_api_key

# CRITICAL: Set this to your production domain for OAuth to work
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

**⚠️ IMPORTANT**: Without `NEXT_PUBLIC_SITE_URL`, Google OAuth will fail in production!

### 2. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Update **Authorized redirect URIs**:
   - Remove: `http://localhost:3000/auth/callback` (for security)
   - Ensure: `https://rvynhgxdjikninyszkmq.supabase.co/auth/v1/callback` is present

### 3. Supabase Configuration

1. Go to your Supabase project dashboard
2. Navigate to Authentication → Providers → Google
3. Verify settings:
   - ✅ Google provider is enabled
   - ✅ Client ID and Secret are set
   - ✅ Redirect URL: `https://rvynhgxdjikninyszkmq.supabase.co/auth/v1/callback`

## Deployment Platforms

### Vercel Deployment

1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Vercel
3. Add environment variables in Project Settings → Environment Variables
4. Deploy

### Netlify Deployment

1. Connect your repository to Netlify
2. Add environment variables in Site Settings → Environment Variables
3. Deploy

### Other Platforms

For other platforms, ensure:
- Node.js 18+ support
- Environment variables are properly set
- Build command: `npm run build`
- Start command: `npm start`

## Post-Deployment Testing

1. **Test Google Sign-In**:
   - Visit your production URL
   - Click "Sign In with Google"
   - Should redirect to Google auth, then back to your app

2. **Test Data Sync**:
   - Create tasks while signed out (guest mode)
   - Sign in with Google
   - Verify tasks sync to the cloud

3. **Test Offline Functionality**:
   - Disconnect internet
   - Create/edit tasks
   - Reconnect and verify sync

## Troubleshooting

### "Invalid Redirect URI" Error
- Check that `NEXT_PUBLIC_SITE_URL` matches your production domain exactly
- Verify Google OAuth settings include the correct redirect URI
- Remove localhost URLs from production OAuth settings

### OAuth Works Locally But Not in Production
- Most likely missing `NEXT_PUBLIC_SITE_URL` environment variable
- Check deployment platform's environment variable settings
- Verify the domain in the environment variable matches your actual domain

### Tasks Not Syncing
- Check Supabase connection in browser developer tools
- Verify environment variables are set correctly
- Check Supabase RLS policies in the SQL Editor

## Quick Fix Commands

If you need to update environment variables after deployment:

**Vercel**:
```bash
vercel env add NEXT_PUBLIC_SITE_URL
# Enter your production URL when prompted
vercel --prod
```

**Netlify**:
- Go to Site Settings → Environment Variables
- Add `NEXT_PUBLIC_SITE_URL` with your production domain
- Redeploy the site

## Support

If you encounter issues:
1. Check browser developer console for errors
2. Verify all environment variables are set
3. Test the OAuth flow step by step
4. Ensure database schema is properly applied

The app is designed to work offline-first, so basic functionality should work even if authentication has issues.
