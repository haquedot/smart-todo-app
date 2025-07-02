# Smart Todo App Setup Instructions

## Environment Variable Setup

To enable AI-powered task suggestions, you need to set up a Gemini API key:

1. **Get your Gemini API key:**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account
   - Create a new API key

2. **Set up your environment file:**
   - Copy the `.env.example` file to `.env.local`
   - Replace `your_gemini_api_key_here` with your actual API key

   ```bash
   # Copy the example file
   cp .env.example .env.local
   
   # Edit the file and add your API key
   GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Restart your development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   # or
   yarn dev
   ```

## Note

If you don't set up the API key, the app will still work but will use fallback task suggestions instead of AI-generated ones.

## Troubleshooting

- **Hydration errors:** These are typically resolved by refreshing the page once the environment is properly set up
- **API key not working:** Make sure there are no extra spaces or quotes around your API key in the `.env.local` file
- **Still seeing errors:** Check the browser console for more detailed error messages
