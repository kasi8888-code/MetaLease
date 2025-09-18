const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  console.log("🧪 Testing MetaLease on Sepolia Testnet...\n");

  // Get contract addresses from environment
  const rentableNFTAddress = process.env.NEXT_PUBLIC_RENTABLE_NFT_ADDRESS;
  const marketplaceAddress = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS;

  if (!rentableNFTAddress || !marketplaceAddress) {
    console.log("❌ Please set contract addresses in .env.local first!");
    console.log("Run deployment script and update NEXT_PUBLIC_RENTABLE_NFT_ADDRESS and NEXT_PUBLIC_MARKETPLACE_ADDRESS");
    return;
  }

  const [deployer, user1, user2] = await ethers.getSigners();
  
  console.log("🔗 Connecting to deployed contracts...");
  console.log(`📍 RentableNFT: ${rentableNFTAddress}`);
  console.log(`📍 Marketplace: ${marketplaceAddress}\n`);

  // Connect to deployed contracts
  const RentableNFT = await ethers.getContractFactory("RentableNFT");
  const rentableNFT = RentableNFT.attach(rentableNFTAddress);

  const Marketplace = await ethers.getContractFactory("NFTRentalMarketplace");
  const marketplace = Marketplace.attach(marketplaceAddress);

  // Test 1: Mint NFT
  console.log("1️⃣ Testing NFT minting...");
  try {
    const mintTx = await rentableNFT.mint(user1.address, "https://example.com/metadata/1");
    const receipt = await mintTx.wait();
    console.log("✅ NFT minted! Token ID: 1");
    console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
    console.log(`   Tx hash: ${receipt.hash}`);
  } catch (error) {
    console.log("❌ Minting failed:", error.message);
  }

  // Test 2: List for rent
  console.log("\n2️⃣ Testing marketplace listing...");
  try {
    const hourlyRate = ethers.parseEther("0.001"); // 0.001 ETH per hour
    const dailyRate = ethers.parseEther("0.02");   // 0.02 ETH per day
    
    const listTx = await marketplace.connect(user1).listNFTForRent(
      rentableNFTAddress,
      1,
      hourlyRate,
      dailyRate,
      1, // min 1 hour
      24 // max 24 hours
    );
    const receipt = await listTx.wait();
    console.log("✅ NFT listed for rent!");
    console.log(`   Hourly rate: 0.001 ETH`);
    console.log(`   Daily rate: 0.02 ETH`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
    console.log(`   Tx hash: ${receipt.hash}`);
  } catch (error) {
    console.log("❌ Listing failed:", error.message);
  }

  // Test 3: Rent NFT
  console.log("\n3️⃣ Testing NFT rental...");
  try {
    const rentalCost = await marketplace.calculateRentalCost(1, 2, true); // 2 hours
    
    const rentTx = await marketplace.connect(user2).rentNFT(1, 2, true, {
      value: rentalCost
    });
    const receipt = await rentTx.wait();
    console.log("✅ NFT rented successfully!");
    console.log(`   Rental cost: ${ethers.formatEther(rentalCost)} ETH`);
    console.log(`   Duration: 2 hours`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
    console.log(`   Tx hash: ${receipt.hash}`);
    
    // Check rental state
    const currentRenter = await rentableNFT.userOf(1);
    const isRented = await rentableNFT.isRented(1);
    console.log(`   Current renter: ${currentRenter}`);
    console.log(`   Is rented: ${isRented}`);
  } catch (error) {
    console.log("❌ Rental failed:", error.message);
  }

  // Test 4: Check states
  console.log("\n4️⃣ Checking contract states...");
  try {
    const totalSupply = await rentableNFT.totalSupply();
    const owner = await rentableNFT.ownerOf(1);
    const activeListings = await marketplace.getActiveListings();
    
    console.log("✅ Contract states:");
    console.log(`   Total NFTs minted: ${totalSupply.toString()}`);
    console.log(`   NFT #1 owner: ${owner}`);
    console.log(`   Active listings: ${activeListings.length}`);
  } catch (error) {
    console.log("❌ State check failed:", error.message);
  }

  console.log("\n🎉 Sepolia testnet testing complete!");
  console.log("\n🔗 View transactions on Etherscan:");
  console.log(`   https://sepolia.etherscan.io/address/${rentableNFTAddress}`);
  console.log(`   https://sepolia.etherscan.io/address/${marketplaceAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Testing failed:", error);
    process.exit(1);
  });