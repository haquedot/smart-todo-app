# OAuth Localhost Redirect Issue - Debugging Guide

## The Problem
Your app is redirecting to `http://localhost:3000` after Google OAuth login in production, instead of staying on your production domain.

## Root Cause
The `NEXT_PUBLIC_SITE_URL` environment variable is either:
1. Not set in your production deployment platform
2. Not being read correctly by the application
3. Cached from a previous build

## Step-by-Step Debugging

### Step 1: Check Environment Variables in Production

**Deploy these changes first:**
```bash
# Build and deploy the current code
npm run build
# Then deploy to your platform (Vercel/Netlify/etc.)
```

### Step 2: Test in Production Browser

1. Go to your production site: `https://smart-todo-app-ruby.vercel.app`
2. Open browser Developer Tools (F12)
3. Look for the **red "Debug OAuth" button** in bottom-right corner
4. Click it to see environment debug info
5. Check what `NEXT_PUBLIC_SITE_URL` shows

### Step 3: Verify Environment Variables in Deployment Platform

**For Vercel:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project: `smart-todo-app-ruby`
3. Go to Settings → Environment Variables
4. Verify these are set:
   ```
   NEXT_PUBLIC_SITE_URL = https://smart-todo-app-ruby.vercel.app
   NEXT_PUBLIC_SUPABASE_URL = https://rvynhgxdjikninyszkmq.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = (your key)
   GEMINI_API_KEY = (your key)
   ```

**For Netlify:**
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Find your site
3. Go to Site Settings → Environment Variables
4. Add the same variables

### Step 4: Force Redeploy

After setting environment variables:

**Vercel:**
```bash
# Trigger new deployment
git commit --allow-empty -m "Force redeploy for env vars"
git push
```

**Netlify:**
- Click "Trigger deploy" in the dashboard

### Step 5: Clear Build Cache

**Vercel:**
- In project settings, go to Functions tab
- Click "Clear Cache"
- Redeploy

**Netlify:**
- In site settings, go to Build & Deploy
- Click "Clear cache and deploy site"

### Step 6: Test OAuth Flow

1. Visit production site
2. Open Developer Tools → Console
3. Paste this code and run:
   ```javascript
   // Copy content from debug-oauth.js
   ```
4. Click "Sign In" and watch the console
5. Note the redirect URL being used

### Step 7: Verify Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services → Credentials
3. Find your OAuth 2.0 Client ID
4. Check "Authorized redirect URIs":
   - ✅ Should have: `https://rvynhgxdjikninyszkmq.supabase.co/auth/v1/callback`
   - ❌ Should NOT have: `http://localhost:3000/auth/callback` (remove this)

### Step 8: Verify Supabase Settings

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open your project
3. Go to Authentication → Providers → Google
4. Verify:
   - ✅ Google provider is enabled
   - ✅ Client ID and Secret are set
   - ✅ Redirect URL: `https://rvynhgxdjikninyszkmq.supabase.co/auth/v1/callback`

## Common Issues & Solutions

### Issue: Environment variable not showing in debug
**Solution:** 
- Environment variable not set in deployment platform
- Clear cache and redeploy

### Issue: Shows `window.location.origin` instead of `NEXT_PUBLIC_SITE_URL`
**Solution:**
- Environment variable is not being read
- Check if it's prefixed with `NEXT_PUBLIC_`
- Ensure it's set for production environment (not just preview)

### Issue: Still redirects to localhost
**Solution:**
- Clear browser cache completely
- Try incognito/private browsing mode
- Check Google OAuth settings

### Issue: "Invalid redirect URI" error
**Solution:**
- Google OAuth doesn't have the correct redirect URI
- Must be: `https://rvynhgxdjikninyszkmq.supabase.co/auth/v1/callback`

## Emergency Fix

If nothing else works, you can hardcode the production URL temporarily:

1. Edit `lib/auth.tsx`
2. Replace the `getRedirectUrl` function:
   ```typescript
   const getRedirectUrl = () => {
     // Temporary hardcode for production
     if (typeof window !== 'undefined' && window.location.origin.includes('vercel.app')) {
       return 'https://smart-todo-app-ruby.vercel.app/auth/callback'
     }
     // ... rest of existing logic
   }
   ```

**Remember to remove this hardcode after fixing the environment variable issue.**

## Testing Checklist

- [ ] Environment variables are set in deployment platform
- [ ] Build cache is cleared
- [ ] New deployment is triggered
- [ ] Debug info shows correct `NEXT_PUBLIC_SITE_URL`
- [ ] Google OAuth has correct redirect URI
- [ ] Supabase has correct settings
- [ ] OAuth redirects to production domain (not localhost)

## Need More Help?

1. **Share the debug output** from the "Debug OAuth" button
2. **Screenshot** of your deployment platform's environment variables
3. **Copy/paste** any console errors
4. **Verify** your deployment URL matches the environment variable exactly
