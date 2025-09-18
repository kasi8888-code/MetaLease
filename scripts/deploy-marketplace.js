const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    
    console.log("Deploying remaining contracts with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

    // RentableNFT is already deployed
    const rentableNFTAddress = "0x4e3544cB317c9c42F9898D18681F4873da7c76fd";
    console.log("Using existing RentableNFT at:", rentableNFTAddress);

    // Deploy NFTRentalMarketplace with optimized gas settings
    console.log("\nDeploying NFTRentalMarketplace...");
    
    const NFTRentalMarketplace = await ethers.getContractFactory("NFTRentalMarketplace");
    
    // Get current network gas settings
    const feeData = await ethers.provider.getFeeData();
    console.log("Current gas price:", ethers.formatUnits(feeData.gasPrice, "gwei"), "gwei");
    
    // Deploy with custom gas settings
    const marketplace = await NFTRentalMarketplace.deploy(rentableNFTAddress, {
        gasLimit: 5000000, // Increase gas limit significantly
        gasPrice: feeData.gasPrice // Use current network gas price
    });

    console.log("Transaction hash:", marketplace.deploymentTransaction().hash);
    console.log("Waiting for deployment confirmation...");
    
    await marketplace.waitForDeployment();
    const marketplaceAddress = await marketplace.getAddress();

    console.log("✅ NFTRentalMarketplace deployed to:", marketplaceAddress);

    // Verify the deployment
    console.log("\nVerifying deployment...");
    try {
        const deployedMarketplace = await ethers.getContractAt("NFTRentalMarketplace", marketplaceAddress);
        const nftContract = await deployedMarketplace.nftContract();
        console.log("✅ Marketplace NFT contract address:", nftContract);
        console.log("✅ Matches RentableNFT address:", nftContract === rentableNFTAddress);
    } catch (error) {
        console.log("⚠️  Verification failed:", error.message);
    }

    console.log("\n🎉 PHASE 1 DEPLOYMENT COMPLETE!");
    console.log("=====================================");
    console.log("RentableNFT:", rentableNFTAddress);
    console.log("NFTRentalMarketplace:", marketplaceAddress);
    console.log("=====================================");
    
    console.log("\n📝 Next steps:");
    console.log("1. Update your .env.local file with the marketplace address");
    console.log("2. Verify contracts on Etherscan");
    console.log("3. Test the contracts with the test script");
    
    console.log("\n💰 Final balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:", error.message);
        if (error.code === 'INSUFFICIENT_FUNDS') {
            console.log("\n💡 Solution: Get more Sepolia ETH from https://sepoliafaucet.com/");
        } else if (error.message.includes('gas')) {
            console.log("\n💡 Gas issue detected. The contract might be too complex for current gas limits.");
        }
        process.exit(1);
    });