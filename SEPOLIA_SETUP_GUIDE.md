# 🌐 Sepolia Testnet Setup Guide for MetaLease

## 📱 MetaMask Configuration

### Step 1: Add Sepolia Network to MetaMask

Sepolia is now included by default in MetaMask, but if you need to add it manually:

**Network Details:**
- **Network Name:** Sepolia test network
- **New RPC URL:** `https://sepolia.infura.io/v3/` or `https://rpc.sepolia.org`
- **Chain ID:** `11155111`
- **Currency Symbol:** `SEP`
- **Block Explorer URL:** `https://sepolia.etherscan.io`

### Step 2: Get Sepolia Test ETH

You need Sepolia ETH to pay for gas fees. Get free test ETH from these faucets:

1. **Sepolia Faucet** - https://sepoliafaucet.com/
2. **Alchemy Faucet** - https://sepoliafaucet.com/
3. **Infura Faucet** - https://infura.io/faucet/sepolia
4. **QuickNode Faucet** - https://faucet.quicknode.com/ethereum/sepolia

### Step 3: Switch to Sepolia in MetaMask

1. Open MetaMask
2. Click the network dropdown at the top
3. Select "Sepolia test network"
4. Ensure you have some SEP tokens for gas fees

## 🚀 Your MetaLease Contract Addresses

Your smart contracts are already deployed on Sepolia:

- **RentableNFT Contract:** `0x4e3544cB317c9c42F9898D18681F4873da7c76fd`
- **Marketplace Contract:** `0xDeCb458F3aA179510A547e47b45F59fD2d5C3c56`

## 🔗 Verify Contracts on Sepolia Etherscan

- **RentableNFT:** https://sepolia.etherscan.io/address/0x4e3544cB317c9c42F9898D18681F4873da7c76fd
- **Marketplace:** https://sepolia.etherscan.io/address/0xDeCb458F3aA179510A547e47b45F59fD2d5C3c56

## 💡 Using MetaLease Platform

### Step 1: Start the Platform
```bash
npm run dev
```
Access at: http://localhost:3000

### Step 2: Connect Your Wallet
1. Click "Connect Wallet"
2. Select MetaMask
3. Ensure you're on Sepolia network
4. Approve the connection

### Step 3: Create Your First NFT
1. Go to "Create NFT" page
2. Upload an image (automatically stored on IPFS)
3. Add metadata (name, description, pricing)
4. Click "Create & List NFT"
5. Approve the transaction in MetaMask

### Step 4: Explore the Marketplace
1. Visit the "Marketplace" page
2. Browse available NFTs for rent
3. Click "Rent Now" on any NFT
4. Set rental duration and confirm

### Step 5: Check Your Dashboard
1. View your owned NFTs
2. Track your rentals
3. Monitor earnings
4. See rental history

## 🧪 Test Your Setup

Run the end-to-end test to verify everything works:
```bash
node test-end-to-end.js
```

## 📊 Platform Features Ready

✅ **IPFS Storage** - Images and metadata permanently stored  
✅ **JWT Authentication** - Secure Pinata integration  
✅ **Smart Contracts** - Deployed on Sepolia  
✅ **Marketplace** - Browse and rent NFTs  
✅ **Dashboard** - Track your NFTs and earnings  
✅ **Real-time Updates** - Live rental status  

## 🎯 What You Can Do Now

1. **Create NFTs** with real IPFS storage
2. **List NFTs** for rent with custom rates
3. **Rent other NFTs** for specified durations
4. **Earn money** from your NFT rentals
5. **Track everything** in your dashboard

## 🚨 Important Notes

- **Network:** Always use Sepolia testnet
- **Gas Fees:** You need SEP tokens for transactions
- **Test Environment:** This is for testing only
- **Real Usage:** Switch to mainnet for production

## 🔗 Useful Links

- **Sepolia Etherscan:** https://sepolia.etherscan.io
- **MetaMask Help:** https://metamask.zendesk.com
- **IPFS Explorer:** https://gateway.pinata.cloud/ipfs/
- **Your Platform:** http://localhost:3000

---

🎉 **Your MetaLease platform is ready for Sepolia testnet!**