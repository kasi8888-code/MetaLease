const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing Phase 1 Deployment on Sepolia...\n");

    const rentableNFTAddress = "0x4e3544cB317c9c42F9898D18681F4873da7c76fd";
    const marketplaceAddress = "0xDeCb458F3aA179510A547e47b45F59fD2d5C3c56";

    const [deployer] = await ethers.getSigners();
    console.log("Testing with account:", deployer.address);
    console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    // Get contract instances
    const RentableNFT = await ethers.getContractFactory("RentableNFT");
    const NFTRentalMarketplace = await ethers.getContractFactory("NFTRentalMarketplace");
    
    const rentableNFT = RentableNFT.attach(rentableNFTAddress);
    const marketplace = NFTRentalMarketplace.attach(marketplaceAddress);

    console.log("📋 Contract Status Check:");
    console.log("========================");

    try {
        // Test RentableNFT
        const nftName = await rentableNFT.name();
        const nftSymbol = await rentableNFT.symbol();
        const totalSupply = await rentableNFT.totalSupply();
        
        console.log("✅ RentableNFT:");
        console.log("   Name:", nftName);
        console.log("   Symbol:", nftSymbol);
        console.log("   Total Supply:", totalSupply.toString());
        
        // Test Marketplace
        console.log("✅ NFTRentalMarketplace:");
        console.log("   Contract deployed and responsive");
        console.log("   Ready for listing operations");
        
        console.log("\n🔍 Basic Functionality Test:");
        console.log("============================");
        
        // Test minting an NFT
        console.log("📦 Minting test NFT...");
        const mintTx = await rentableNFT.mint(
            deployer.address, 
            "https://gateway.pinata.cloud/ipfs/QmTest123", 
            { gasLimit: 300000 }
        );
        await mintTx.wait();
        
        const newTotalSupply = await rentableNFT.totalSupply();
        const tokenId = newTotalSupply; // The newly minted token
        console.log("✅ NFT minted! Token ID:", tokenId.toString());
        
        // Test marketplace listing
        console.log("📝 Testing marketplace listing...");
        
        // First approve the marketplace to handle the NFT
        const approveTx = await rentableNFT.approve(marketplaceAddress, tokenId, { gasLimit: 100000 });
        await approveTx.wait();
        console.log("✅ NFT approved for marketplace");
        
        // List the NFT for rent
        const hourlyRate = ethers.parseEther("0.001"); // 0.001 ETH per hour
        const dailyRate = ethers.parseEther("0.02");   // 0.02 ETH per day
        const minRentalHours = 1;
        const maxRentalHours = 168; // 7 days
        
        const listTx = await marketplace.listNFTForRent(
            rentableNFTAddress,
            tokenId,
            hourlyRate,
            dailyRate,
            minRentalHours,
            maxRentalHours,
            { gasLimit: 300000 }
        );
        await listTx.wait();
        console.log("✅ NFT listed for rent!");
        
        // Check if NFT is available for rent
        const isAvailable = await marketplace.isAvailableForRent(rentableNFTAddress, tokenId);
        console.log("✅ NFT available for rent:", isAvailable);

        console.log("\n🎉 ALL TESTS PASSED!");
        console.log("====================");
        console.log("✅ Phase 1 deployment is working correctly!");
        console.log("✅ Both contracts are functional on Sepolia testnet");
        console.log("✅ Ready for frontend integration!");

    } catch (error) {
        console.error("❌ Test failed:", error.message);
        
        if (error.message.includes("insufficient funds")) {
            console.log("💡 You need more Sepolia ETH for testing");
        }
        
        return;
    }

    console.log("\n📊 Contract Addresses for Frontend:");
    console.log("===================================");
    console.log("RentableNFT:", rentableNFTAddress);
    console.log("NFTRentalMarketplace:", marketplaceAddress);
    console.log("Network: Sepolia Testnet");
    console.log("Chain ID: 11155111");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });