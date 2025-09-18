const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  try {
    console.log("🚀 Deploying remaining contracts to Sepolia Testnet...");
    
    const signers = await ethers.getSigners();
    const deployer = signers[0];
    console.log("Deploying with account:", deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");

    // RentableNFT is already deployed
    const rentableNFTAddress = "0x4e3544cB317c9c42F9898D18681F4873da7c76fd";
    console.log("✅ RentableNFT already deployed at:", rentableNFTAddress);

    // Deploy NFTRentalMarketplace with lower gas price
    console.log("\n📦 Deploying NFTRentalMarketplace with reduced gas...");
    const NFTRentalMarketplace = await ethers.getContractFactory("NFTRentalMarketplace");
    const marketplace = await NFTRentalMarketplace.deploy(deployer.address, {
      gasPrice: ethers.parseUnits("10", "gwei") // Lower gas price
    });
    await marketplace.waitForDeployment();
    const marketplaceAddress = await marketplace.getAddress();

    console.log("✅ NFTRentalMarketplace deployed to:", marketplaceAddress);

    // Connect to the existing RentableNFT
    const RentableNFT = await ethers.getContractFactory("RentableNFT");
    const rentableNFT = RentableNFT.attach(rentableNFTAddress);

    // Set marketplace contract in RentableNFT
    console.log("\n🔗 Connecting contracts...");
    const tx = await rentableNFT.setMarketplaceContract(marketplaceAddress, {
      gasPrice: ethers.parseUnits("10", "gwei")
    });
    await tx.wait();

    console.log("✅ Contracts connected successfully!");

    // Display deployment summary
    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("=" .repeat(60));
    console.log(`🎨 RentableNFT:        ${rentableNFTAddress}`);
    console.log(`🏪 Marketplace:        ${marketplaceAddress}`);
    console.log(`👤 Deployer:           ${deployer.address}`);
    console.log(`🌐 Network:            Sepolia Testnet`);
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
    console.log("\n🔗 VIEW ON ETHERSCAN:");
    console.log(`RentableNFT: https://sepolia.etherscan.io/address/${rentableNFTAddress}`);
    console.log(`Marketplace: https://sepolia.etherscan.io/address/${marketplaceAddress}`);

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });