#!/bin/bash

# MetaLease - Vercel Deployment Script
echo "🚀 MetaLease - Preparing for Vercel Deployment"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the MetaLease project root directory"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Clean build
echo "🧹 Cleaning previous build..."
rm -rf .next

# Run build test
echo "🏗️ Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment initiated!"
echo "📋 Next steps:"
echo "   1. Configure environment variables in Vercel dashboard"
echo "   2. Test the deployed application"
echo "   3. Monitor the deployment logs"
echo ""
echo "🔗 Environment Variables to set in Vercel:"
echo "   - NEXT_PUBLIC_SEPOLIA_RPC_URL"
echo "   - NEXT_PUBLIC_PINATA_JWT"
echo "   - NEXT_PUBLIC_PINATA_API_KEY"
echo "   - NEXT_PUBLIC_PINATA_SECRET_KEY"
echo "   - NEXT_PUBLIC_PROJECT_ID"
echo "   - NEXT_PUBLIC_RENTABLE_NFT_ADDRESS"
echo "   - NEXT_PUBLIC_MARKETPLACE_ADDRESS"
echo "   - ETHERSCAN_API_KEY"
echo ""
echo "📚 See VERCEL-DEPLOYMENT.md for complete guide"