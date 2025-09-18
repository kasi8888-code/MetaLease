# MetaLease - Vercel Deployment Script (Windows)

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the MetaLease project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 MetaLease - Preparing for Vercel Deployment" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (!$vercelInstalled) {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Clean build
Write-Host "🧹 Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
}

# Run build test
Write-Host "🏗️ Testing build..." -ForegroundColor Yellow
$buildResult = npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed. Please fix errors before deploying." -ForegroundColor Red
    exit 1
}

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Green
vercel --prod

Write-Host ""
Write-Host "🎉 Deployment initiated!" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Configure environment variables in Vercel dashboard" -ForegroundColor White
Write-Host "   2. Test the deployed application" -ForegroundColor White
Write-Host "   3. Monitor the deployment logs" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Environment Variables to set in Vercel:" -ForegroundColor Cyan
Write-Host "   - NEXT_PUBLIC_SEPOLIA_RPC_URL" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_PINATA_JWT" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_PINATA_API_KEY" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_PINATA_SECRET_KEY" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_PROJECT_ID" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_RENTABLE_NFT_ADDRESS" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_MARKETPLACE_ADDRESS" -ForegroundColor White
Write-Host "   - ETHERSCAN_API_KEY" -ForegroundColor White
Write-Host ""
Write-Host "📚 See VERCEL-DEPLOYMENT.md for complete guide" -ForegroundColor Yellow