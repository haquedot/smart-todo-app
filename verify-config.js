#!/usr/bin/env node

/**
 * Configuration Verification Script
 * Run with: node verify-config.js
 * 
 * This script helps verify that your environment is properly configured
 * for production deployment with Google OAuth authentication.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Smart Todo App - Configuration Verification\n');

// Check for .env files
const envLocal = path.join(process.cwd(), '.env.local');
const envExample = path.join(process.cwd(), '.env.example');

let envVars = {};

if (fs.existsSync(envLocal)) {
  console.log('✅ .env.local file found');
  const envContent = fs.readFileSync(envLocal, 'utf8');
  
  // Parse environment variables
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...values] = line.split('=');
      if (key && values.length > 0) {
        envVars[key] = values.join('=');
      }
    }
  });
} else {
  console.log('❌ .env.local file not found');
  console.log('   Copy .env.example to .env.local and fill in your values\n');
}

// Required variables
const requiredVars = {
  'NEXT_PUBLIC_SUPABASE_URL': 'Supabase project URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Supabase anonymous key',
  'GEMINI_API_KEY': 'Gemini API key for AI features'
};

// Production-specific variables
const productionVars = {
  'NEXT_PUBLIC_SITE_URL': 'Production site URL (required for OAuth)'
};

console.log('\n📋 Required Environment Variables:');
let allRequired = true;

Object.entries(requiredVars).forEach(([key, description]) => {
  if (envVars[key] && envVars[key] !== 'your_' + key.toLowerCase().replace(/next_public_/g, '').replace(/_/g, '_') + '_here') {
    console.log(`✅ ${key}: Set`);
  } else {
    console.log(`❌ ${key}: Missing or not configured`);
    console.log(`   Description: ${description}`);
    allRequired = false;
  }
});

console.log('\n🚀 Production Deployment Variables:');
let productionReady = true;

Object.entries(productionVars).forEach(([key, description]) => {
  if (envVars[key] && envVars[key] !== 'https://your-production-domain.com') {
    console.log(`✅ ${key}: ${envVars[key]}`);
    
    // Validate URL format
    try {
      new URL(envVars[key]);
      console.log(`   ✅ Valid URL format`);
    } catch (e) {
      console.log(`   ❌ Invalid URL format`);
      productionReady = false;
    }
  } else {
    console.log(`⚠️  ${key}: Not set (required for production)`);
    console.log(`   Description: ${description}`);
    productionReady = false;
  }
});

console.log('\n📁 Required Files:');
const requiredFiles = [
  'AUTH_SETUP.md',
  'PRODUCTION_DEPLOY.md',
  'supabase-schema.sql'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(process.cwd(), file))) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

console.log('\n📊 Summary:');
if (allRequired) {
  console.log('✅ All required environment variables are configured');
} else {
  console.log('❌ Some required environment variables are missing');
  console.log('   Please check your .env.local file');
}

if (productionReady) {
  console.log('✅ Ready for production deployment');
} else {
  console.log('⚠️  Production deployment requires additional configuration');
  console.log('   Set NEXT_PUBLIC_SITE_URL before deploying');
}

console.log('\n📚 Next Steps:');
if (!allRequired) {
  console.log('1. Configure missing environment variables in .env.local');
  console.log('2. Follow AUTH_SETUP.md for authentication setup');
}
if (!productionReady) {
  console.log('3. Read PRODUCTION_DEPLOY.md before deploying to production');
  console.log('4. Set NEXT_PUBLIC_SITE_URL to your production domain');
}
console.log('5. Test authentication locally before deploying');

console.log('\n🔗 Helpful Links:');
console.log('- Supabase Dashboard: https://supabase.com/dashboard');
console.log('- Gemini API Keys: https://aistudio.google.com/app/apikey');
console.log('- Google Cloud Console: https://console.cloud.google.com');
