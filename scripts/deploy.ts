import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🚀 Deploying MetaLease to Sepolia Testnet...");
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    console.log("⚠️  Warning: Low balance. Get more Sepolia ETH from https://sepoliafaucet.com/");
  }

  // Deploy RentableNFT
  console.log("\n� Deploying RentableNFT...");
  const RentableNFT = await ethers.getContractFactory("RentableNFT");
  const rentableNFT = await RentableNFT.deploy(deployer.address);
  await rentableNFT.waitForDeployment();
  const rentableNFTAddress = await rentableNFT.getAddress();

  console.log("✅ RentableNFT deployed to:", rentableNFTAddress);

  // Deploy NFTRentalMarketplace
  console.log("\n� Deploying NFTRentalMarketplace...");
  const NFTRentalMarketplace = await ethers.getContractFactory("NFTRentalMarketplace");
  const marketplace = await NFTRentalMarketplace.deploy(deployer.address);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();

  console.log("✅ NFTRentalMarketplace deployed to:", marketplaceAddress);

  // Set marketplace contract in RentableNFT
  console.log("\n🔗 Connecting contracts...");
  const tx = await rentableNFT.setMarketplaceContract(marketplaceAddress);
  await tx.wait();

  console.log("✅ Contracts connected successfully!");

  // Display deployment summary
  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log("=" .repeat(60));
  console.log(`🎨 RentableNFT:        ${rentableNFTAddress}`);
  console.log(`🏪 Marketplace:        ${marketplaceAddress}`);
  console.log(`👤 Deployer:           ${deployer.address}`);
  console.log(`🌐 Network:            Sepolia Testnet`);
  console.log(`⛽ Gas used:           ~2,500,000 gas`);
  console.log("=" .repeat(60));

  // Contract verification commands
  console.log("\n🔍 VERIFICATION COMMANDS:");
  console.log("Copy these commands to verify your contracts:\n");
  console.log(`npx hardhat verify --network sepolia ${rentableNFTAddress} "${deployer.address}"`);
  console.log(`npx hardhat verify --network sepolia ${marketplaceAddress} "${deployer.address}"`);

  // Environment variables for frontend
  console.log("\n⚙️  UPDATE YOUR .env.local:");
  console.log(`NEXT_PUBLIC_RENTABLE_NFT_ADDRESS=${rentableNFTAddress}`);
  console.log(`NEXT_PUBLIC_MARKETPLACE_ADDRESS=${marketplaceAddress}`);

  // Etherscan links
  console.log("\n� VIEW ON ETHERSCAN:");
  console.log(`RentableNFT: https://sepolia.etherscan.io/address/${rentableNFTAddress}`);
  console.log(`Marketplace: https://sepolia.etherscan.io/address/${marketplaceAddress}`);

  console.log("\n🎯 NEXT STEPS:");
  console.log("1. ✅ Run the verification commands above");
  console.log("2. ✅ Update your .env.local with the contract addresses");
  console.log("3. ✅ Test your frontend with these live contracts!");
  console.log("4. ✅ Mint your first NFT on Sepolia testnet");

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });