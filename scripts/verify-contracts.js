const hre = require("hardhat");

async function main() {
    console.log("🔍 Verifying contracts on Etherscan...\n");

    const rentableNFTAddress = "0x4e3544cB317c9c42F9898D18681F4873da7c76fd";
    const marketplaceAddress = "0xDeCb458F3aA179510A547e47b45F59fD2d5C3c56";

    try {
        console.log("📝 Verifying RentableNFT...");
        await hre.run("verify:verify", {
            address: rentableNFTAddress,
            constructorArguments: [], // No constructor arguments
        });
        console.log("✅ RentableNFT verified!");
    } catch (error) {
        console.log("⚠️  RentableNFT verification:", error.message);
    }

    try {
        console.log("📝 Verifying NFTRentalMarketplace...");
        await hre.run("verify:verify", {
            address: marketplaceAddress,
            constructorArguments: [], // No constructor arguments
        });
        console.log("✅ NFTRentalMarketplace verified!");
    } catch (error) {
        console.log("⚠️  NFTRentalMarketplace verification:", error.message);
    }

    console.log("\n� Etherscan Links:");
    console.log("==================");
    console.log("RentableNFT:", `https://sepolia.etherscan.io/address/${rentableNFTAddress}`);
    console.log("NFTRentalMarketplace:", `https://sepolia.etherscan.io/address/${marketplaceAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });