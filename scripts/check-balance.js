const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    
    console.log("Account address:", deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Current balance:", ethers.formatEther(balance), "ETH");
    
    // Calculate how much we need for the marketplace
    const estimatedGasNeeded = 1000000; // Conservative estimate
    const gasPrice = await ethers.provider.getFeeData();
    const estimatedCost = BigInt(estimatedGasNeeded) * gasPrice.gasPrice;
    
    console.log("Estimated cost for marketplace deployment:", ethers.formatEther(estimatedCost), "ETH");
    console.log("Gas price:", ethers.formatUnits(gasPrice.gasPrice, "gwei"), "gwei");
    
    const needed = estimatedCost - balance;
    if (needed > 0) {
        console.log("You need approximately:", ethers.formatEther(needed), "more ETH");
        console.log("\nPlease visit: https://sepoliafaucet.com/");
        console.log("Or: https://faucets.chain.link/sepolia");
    } else {
        console.log("You have sufficient balance!");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });