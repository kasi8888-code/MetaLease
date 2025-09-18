# MetaLease - Vercel Deployment Guide

## 🚀 Complete Deployment Checklist

### ✅ Pre-Deployment Status
- [x] Build successful with no warnings
- [x] Images optimized with Next.js Image components
- [x] Environment variables configured
- [x] Smart contracts deployed on Sepolia testnet
- [x] IPFS integration with Pinata working
- [x] Wallet connection tested with MetaMask

## 📋 Deployment Steps

### 1. Environment Variables Setup

**Required Environment Variables for Vercel:**

```bash
# Blockchain Configuration (PUBLIC - Safe to upload)
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=sepolia
NEXT_PUBLIC_FORCE_SEPOLIA=true

# Contract Addresses (PUBLIC - Already Deployed)
NEXT_PUBLIC_RENTABLE_NFT_ADDRESS=0x4e3544cB317c9c42F9898D18681F4873da7c76fd
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0xDeCb458F3aA179510A547e47b45F59fD2d5C3c56

# IPFS Configuration (SERVICE API KEYS - Safe for server)
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token
NEXT_PUBLIC_PINATA_API_KEY=af9c6a35065e1140e73e
NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/

# WalletConnect (PUBLIC PROJECT ID)
NEXT_PUBLIC_PROJECT_ID=2f5a2d1e4b6c3a9f8e7d6c5b4a3f2e1d

# Optional (for contract verification)
ETHERSCAN_API_KEY=UF62GZC4WXINXPBKFEUIABP4CI68XJNGYP
```

**🚨 SECURITY WARNING:**
**NEVER upload these to Vercel or any hosting platform:**
- `PRIVATE_KEY` - Keep this LOCAL ONLY
- Any wallet private keys or seed phrases
- Personal cryptocurrency wallet information

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel CLI
```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd "c:\Users\Naveen kasi\OneDrive\Desktop\metaLease"
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name: metalease or your preferred name
# - Deploy? Yes
```

#### Option B: Deploy via GitHub Integration
1. Push your code to GitHub (already done)
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import from GitHub: `kasi8888-code/MetaLease`
5. Configure environment variables in Vercel dashboard
6. Deploy

### 3. Configure Environment Variables in Vercel

In your Vercel project dashboard:
1. Go to Settings → Environment Variables
2. Add each environment variable from the list above
3. Make sure to select the correct environment (Production, Preview, Development)

### 4. Domain Configuration (Optional)

After successful deployment:
- Vercel provides a `.vercel.app` domain automatically
- You can add a custom domain if needed
- SSL is automatically configured

## 🛠️ Troubleshooting Common Issues

### Build Issues
- **Error: Module not found**: Ensure all dependencies are in `package.json`
- **Webpack errors**: Current config excludes hardhat libraries (✅ configured)
- **Image optimization errors**: All images use Next.js Image with `unoptimized` prop (✅ configured)

### Runtime Issues
- **Wallet connection fails**: Check NEXT_PUBLIC_PROJECT_ID
- **Smart contract errors**: Verify contract addresses and chain ID
- **IPFS upload fails**: Check Pinata API keys and permissions

### Performance Issues
- **Slow loading**: Images are optimized with Next.js (✅)
- **Bundle size**: Webpack externals configured (✅)

## 🔧 Vercel-Specific Configurations

### Build Settings
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

### Functions Configuration
- Serverless functions: Automatic (no additional config needed)
- API routes: Work out of the box with Next.js App Router

### Image Optimization
- Next.js Image component: ✅ Configured
- External domains: ✅ Configured in next.config.ts
- IPFS images: ✅ Supported with unoptimized prop

## 🧪 Post-Deployment Testing

### Essential Tests After Deployment

1. **Wallet Connection**
   - Test MetaMask connection
   - Verify Sepolia network switching
   - Check account balance display

2. **NFT Creation**
   - Upload image to IPFS
   - Mint NFT with metadata
   - Verify NFT appears in dashboard

3. **Marketplace Functionality**
   - Browse listings
   - View NFT details
   - Test rental modal

4. **Rental System**
   - Rent an NFT
   - Process payment with MetaMask
   - Verify transaction on Etherscan
   - Check rental appears in dashboard

5. **Image Display**
   - Verify all images load correctly
   - Test fallback for failed images
   - Check responsive design

## 📱 Mobile Testing

Test on mobile devices:
- Wallet connection via mobile MetaMask
- Touch interactions
- Responsive layout
- Image loading performance

## 🔒 Security Considerations

### Environment Variables
- Never commit sensitive keys to Git ✅
- Use Vercel's encrypted environment variables ✅
- Separate development and production keys

### Smart Contract Security
- Contracts are deployed and immutable ✅
- Using established patterns (ERC721, OpenZeppelin) ✅
- Testnet deployment for safety ✅

## 📊 Monitoring and Analytics

### Built-in Vercel Analytics
- Real User Metrics (RUM)
- Core Web Vitals
- Function logs

### Custom Monitoring
- Console errors for failed transactions
- IPFS upload success rates
- Wallet connection analytics

## 🚀 Production Readiness Checklist

- [x] Build passes without warnings
- [x] Environment variables configured
- [x] Images optimized
- [x] Smart contracts deployed
- [x] IPFS integration working
- [x] Wallet integration tested
- [x] Responsive design
- [x] Error handling implemented
- [x] Loading states added
- [x] Fallback UI for errors

## 📋 Final Deployment Command

```bash
# From your project directory
vercel --prod

# Or if you want to use a specific domain
vercel --prod --meta domain=your-custom-domain.com
```

## 🎉 Success Indicators

Your deployment is successful when:
- ✅ Build completes without errors
- ✅ All pages load correctly
- ✅ Wallet connects on first try
- ✅ Images display properly
- ✅ Smart contract interactions work
- ✅ NFT creation and rental flow complete
- ✅ Responsive on all devices
- ✅ Performance scores are good

## 🆘 Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [MetaMask Developer Docs](https://docs.metamask.io/)
- [Pinata API Documentation](https://docs.pinata.cloud/)

---

**🎯 Your MetaLease NFT Rental Platform is ready for production deployment!**