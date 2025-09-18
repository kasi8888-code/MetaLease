const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing Contract Interaction...\n");

    const rentableNFTAddress = "0x4e3544cB317c9c42F9898D18681F4873da7c76fd";
    const marketplaceAddress = "0xDeCb458F3aA179510A547e47b45F59fD2d5C3c56";

    const [deployer] = await ethers.getSigners();
    console.log("Testing with account:", deployer.address);
    console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    // Get contract instances
    const RentableNFT = await ethers.getContractFactory("RentableNFT");
    const rentableNFT = RentableNFT.attach(rentableNFTAddress);

    try {
        // Test a simple read operation first
        const name = await rentableNFT.name();
        const symbol = await rentableNFT.symbol();
        const totalSupply = await rentableNFT.totalSupply();
        
        console.log("✅ Contract Read Test:");
        console.log("   Name:", name);
        console.log("   Symbol:", symbol);
        console.log("   Total Supply:", totalSupply.toString());
        
        // Test mint with proper gas estimation
        console.log("\n🔄 Testing Mint Transaction...");
        const testTokenURI = "https://gateway.pinata.cloud/ipfs/QmTest123";
        
        // Estimate gas first
        const gasEstimate = await rentableNFT.mint.estimateGas(deployer.address, testTokenURI);
        console.log("   Estimated gas:", gasEstimate.toString());
        
        // Check if gas estimate is reasonable
        if (gasEstimate > 1000000n) {
            console.log("⚠️  High gas estimate detected");
        } else {
            console.log("✅ Gas estimate looks good");
        }

    } catch (error) {
        console.error("❌ Contract interaction failed:", error.message);
        
        if (error.message.includes("insufficient funds")) {
            console.log("💡 You need more Sepolia ETH");
        } else if (error.message.includes("execution reverted")) {
            console.log("💡 Contract call was reverted - check contract state");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });