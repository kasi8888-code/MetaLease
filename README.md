# MetaLease - NFT Rental Marketplace 🚀 

([link](https://recap-delete-04762471.figma.site/))

**The first fully decentralized NFT rental marketplace built on Ethereum.**

Transform your digital assets into income-generating utilities. Lend your NFTs safely while retaining ownership, or borrow NFTs for gaming, exhibitions, and metaverse experiences.

## ✨ Features

### 🔒 **Secure & Trustless**
- Smart contracts ensure NFT owners never lose custody
- ERC-4907 standard for safe rental implementation
- Automatic NFT return after rental period expires
- No third-party risks or intermediaries

### ⚡ **Flexible Rental Options**
- **Hourly Rentals**: Perfect for gaming sessions and short-term use
- **Daily Rentals**: Ideal for exhibitions, events, and extended projects
- **Custom Duration**: Set minimum and maximum rental periods
- **Instant Access**: Immediate NFT utility upon payment

### 🎨 **Complete NFT Ecosystem**
- **Mint Your Own NFTs**: Create digital assets directly on the platform
- **IPFS Storage**: Decentralized metadata and image storage
- **Rich Metadata**: Support for attributes, traits, and properties
- **Cross-Platform Compatible**: Works with games, metaverse, and dApps

### 💰 **Monetize Your Assets**
- **Passive Income**: Earn from NFTs while keeping ownership
- **Dynamic Pricing**: Set different hourly and daily rates
- **Revenue Tracking**: Monitor earnings in real-time
- **Low Platform Fees**: Only 2.5% platform fee on rentals

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Web3 Integration**: wagmi, RainbowKit, viem
- **Smart Contracts**: Solidity, OpenZeppelin, ERC-4907
- **Blockchain**: Ethereum Sepolia Testnet
- **Storage**: IPFS for decentralized metadata
- **UI/UX**: Framer Motion, Lucide Icons
- **Development**: Hardhat, TypeScript, ESLint

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MetaMask wallet extension
- Some Sepolia ETH for testing (get from [faucet](https://sepoliafaucet.com/))

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Get from WalletConnect Cloud (create free account)
   NEXT_PUBLIC_PROJECT_ID=your_walletconnect_project_id
   
   # For IPFS uploads (optional for demo)
   PINATA_API_KEY=your_pinata_api_key
   PINATA_SECRET_KEY=your_pinata_secret_key
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 How It Works

### For NFT Owners (Lenders)

1. **Connect Wallet** - Use MetaMask to connect to Sepolia testnet
2. **Create NFT** - Mint new NFTs or use existing ones
3. **List for Rent** - Set hourly/daily rates and rental terms
4. **Earn Passive Income** - Receive payments automatically
5. **Maintain Ownership** - Always retain NFT custody

### For Renters (Borrowers)

1. **Browse Marketplace** - Discover available NFTs by category
2. **Select Duration** - Choose hourly or daily rental periods
3. **Pay with ETH** - Secure payment via smart contract
4. **Access NFT Utility** - Use NFT in games, metaverse, apps
5. **Automatic Return** - NFT returns to owner when rental expires

## 🎯 Use Cases

### 🎮 **Gaming**
- Rent powerful weapon/character NFTs for tournaments
- Temporary access to rare skins and items
- Try before you buy expensive game assets

### 🎨 **Art & Exhibitions**
- Display rare digital art in virtual galleries
- Showcase NFTs at digital events
- Access premium collections for presentations

### 🌍 **Metaverse**
- Rent virtual land for events
- Temporary access to exclusive spaces
- Try different metaverse identities

### 🎵 **Music & Media**
- License music NFTs for projects
- Access exclusive audio content
- Temporary commercial usage rights

## 🔧 Smart Contract Features

- **ERC-4907 Implementation**: Industry-standard rentable NFTs
- **Automatic Expiry**: No manual intervention needed
- **Gas Optimized**: Efficient contract operations
- **Security Audited**: OpenZeppelin security patterns
- **Upgradeable**: Future-proof architecture

## 🌍 Deployment

### Vercel (Recommended - FREE)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy automatically

### Get WalletConnect Project ID (FREE)

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Create free account
3. Create new project
4. Copy Project ID to `.env.local`

### Get Sepolia ETH (FREE)

1. Go to [Sepolia Faucet](https://sepoliafaucet.com/)
2. Enter your wallet address
3. Get free test ETH for transactions

## 🛡️ Zero Development Cost

This project uses only **FREE** services and tools:

- ✅ **Next.js**: Open source framework
- ✅ **Vercel**: Free tier for hosting
- ✅ **WalletConnect**: Free project ID
- ✅ **Sepolia Testnet**: Free test network
- ✅ **GitHub**: Free repository hosting
- ✅ **MetaMask**: Free wallet
- ✅ **OpenZeppelin**: Free smart contract libraries

Total cost: **$0** ✨

## 🤝 Contributing

We welcome contributions! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Support

- **Issues**: Create GitHub issue for bugs
- **Discussions**: GitHub discussions for questions
- **Documentation**: Check README for setup help

---

**Built with ❤️ for the decentralized future**

*MetaLease - Where NFT utility meets DeFi innovation*
