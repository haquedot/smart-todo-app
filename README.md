# Smart Todo App - Setup Instructions

## Environment Setup

1. **Set up your Gemini API Key:**
   - Copy the `.env.local` file (already created)
   - Get your API key from: https://aistudio.google.com/app/apikey
   - Replace `your_gemini_api_key_here` in `.env.local` with your actual API key

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   # or
   pnpm run dev
   ```

4. **Open your browser:**
   - Go to http://localhost:3000
   - The app should now work without hydration errors
   - AI features will work if you've set up the API key correctly

## Fixes Applied

✅ **Hydration Issues Fixed:**
- Added `ClientOnly` wrapper for client-side components
- Added `suppressHydrationWarning` to body element
- Improved Zustand store hydration with `skipHydration` option
- Fixed PWA installer component mounting

✅ **API Key Issues Fixed:**
- Created proper `.env.local` file
- Updated AI function to use API routes instead of direct calls
- Added fallback suggestions when API key is missing
- Improved error handling in API routes

## Testing the AI Features

1. Click the "AI" button in the app
2. Enter a prompt like "I want to learn React"
3. The AI should generate task suggestions
4. If the API key isn't set, you'll get fallback suggestions instead of errors

The app should now run without hydration errors and the AI features should work properly!

## Authentication Setup (Optional)

For cloud sync and multi-device access:
- Follow the detailed guide in `AUTH_SETUP.md`
- For production deployment, see `PRODUCTION_DEPLOY.md`
- The app works fully offline without authentication

## Production Deployment

⚠️ **Important**: Before deploying to production, read `PRODUCTION_DEPLOY.md` for critical OAuth setup requirements.

**Quick Configuration Check:**
```bash
npm run verify-config
```
This script will verify your environment variables and configuration are ready for deployment.
