# 🚀 Phase 1 Deployment Commands

## ⚠️ BEFORE RUNNING THESE COMMANDS:

1. **Fill in your .env.local file** with real values:
   - PRIVATE_KEY (from MetaMask)
   - ETHERSCAN_API_KEY (from etherscan.io)
   - Get 0.5 Sepolia ETH from https://sepoliafaucet.com/

## 📋 RUN THESE COMMANDS IN ORDER:

### Step 1: Deploy to Sepolia
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

### Step 2: Verify Contracts (use addresses from Step 1 output)
```bash
npx hardhat verify --network sepolia YOUR_NFT_ADDRESS "YOUR_DEPLOYER_ADDRESS"
npx hardhat verify --network sepolia YOUR_MARKETPLACE_ADDRESS "YOUR_DEPLOYER_ADDRESS"
```

### Step 3: Update .env.local with contract addresses
```bash
# Add these lines to your .env.local:
NEXT_PUBLIC_RENTABLE_NFT_ADDRESS=your_nft_contract_address
NEXT_PUBLIC_MARKETPLACE_ADDRESS=your_marketplace_contract_address
```

### Step 4: Test Live Contracts
```bash
npx hardhat run scripts/test-sepolia.js --network sepolia
```

### Step 5: Test Frontend
```bash
npm run dev
# Then open http://localhost:3000 and test with MetaMask on Sepolia
```

---

## ✅ SUCCESS CRITERIA:

After running all commands, you should see:
- ✅ Contracts deployed to Sepolia
- ✅ Contracts verified on Etherscan  
- ✅ Test transactions working
- ✅ Frontend connected to live contracts
- ✅ Can mint and rent NFTs on testnet

## 🆘 NEED HELP?

If any command fails:
1. Check your .env.local has correct values
2. Ensure you have Sepolia ETH in your wallet
3. Make sure MetaMask is on Sepolia network
4. Ask for help with the specific error message

---

**🎯 READY? Let's deploy your contracts to the real blockchain!**