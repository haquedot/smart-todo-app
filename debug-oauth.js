// Production OAuth Debug Script
// Add this to your browser console on the production site to debug OAuth issues

console.log("🔍 OAuth Debug Information");
console.log("========================");

// Environment variables visible to client
console.log("Environment Variables:");
console.log("- NEXT_PUBLIC_SITE_URL:", process.env.NEXT_PUBLIC_SITE_URL || "NOT SET");
console.log("- NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT SET");
console.log("- NODE_ENV:", process.env.NODE_ENV);

// Current location
console.log("\nBrowser Location:");
console.log("- Origin:", window.location.origin);
console.log("- Full URL:", window.location.href);

// Expected redirect URL
const expectedRedirect = process.env.NEXT_PUBLIC_SITE_URL 
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
  : `${window.location.origin}/auth/callback`;

console.log("\nExpected OAuth Redirect URL:");
console.log(expectedRedirect);

// Check if this matches production domain
const isProduction = !window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1');
console.log("\nEnvironment Detection:");
console.log("- Is Production:", isProduction);
console.log("- Domain matches NEXT_PUBLIC_SITE_URL:", process.env.NEXT_PUBLIC_SITE_URL === window.location.origin);

if (isProduction && !process.env.NEXT_PUBLIC_SITE_URL) {
  console.error("❌ CRITICAL: NEXT_PUBLIC_SITE_URL not set in production!");
  console.error("This will cause OAuth to redirect to localhost instead of production domain.");
  console.error("Set NEXT_PUBLIC_SITE_URL=" + window.location.origin + " in your deployment platform.");
}

if (isProduction && process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL !== window.location.origin) {
  console.warn("⚠️ WARNING: NEXT_PUBLIC_SITE_URL doesn't match current domain!");
  console.warn("Current:", window.location.origin);
  console.warn("Environment Variable:", process.env.NEXT_PUBLIC_SITE_URL);
}

console.log("\n🔧 Quick Fixes:");
console.log("1. Ensure NEXT_PUBLIC_SITE_URL is set in your deployment platform");
console.log("2. Redeploy after setting environment variables");
console.log("3. Clear browser cache and try again");
console.log("4. Check Google Cloud Console OAuth settings");

// Test authentication
console.log("\n🧪 To test authentication, run:");
console.log("document.querySelector('[data-testid=\"sign-in-button\"]')?.click() || console.log('Sign-in button not found')");
