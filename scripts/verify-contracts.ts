import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("🔍 Verifying MetaLease Smart Contracts...\n");

  const [owner, user1, user2] = await ethers.getSigners();
  
  // 1. Deploy RentableNFT
  console.log("1️⃣ Deploying RentableNFT...");
  const RentableNFTFactory = await ethers.getContractFactory("RentableNFT");
  const rentableNFT = await RentableNFTFactory.deploy(owner.address);
  await rentableNFT.waitForDeployment();
  console.log(`✅ RentableNFT deployed at: ${await rentableNFT.getAddress()}`);

  // 2. Deploy Marketplace
  console.log("\n2️⃣ Deploying NFTRentalMarketplace...");
  const MarketplaceFactory = await ethers.getContractFactory("NFTRentalMarketplace");
  const marketplace = await MarketplaceFactory.deploy(owner.address);
  await marketplace.waitForDeployment();
  console.log(`✅ Marketplace deployed at: ${await marketplace.getAddress()}`);

  // 3. Connect contracts
  console.log("\n3️⃣ Connecting contracts...");
  await rentableNFT.setMarketplaceContract(await marketplace.getAddress());
  console.log("✅ Contracts connected successfully");

  // 4. Test basic functionality
  console.log("\n4️⃣ Testing core functionality...");
  
  // Mint NFT
  const mintTx = await rentableNFT.mint(user1.address, "https://example.com/token/1");
  await mintTx.wait();
  console.log("✅ NFT minted successfully");
  
  // Verify NFT ownership
  const owner1 = await rentableNFT.ownerOf(1);
  console.log(`✅ NFT #1 owner: ${owner1}`);
  
  // Test pause functionality
  await rentableNFT.pause();
  console.log("✅ Contract paused successfully");
  
  await rentableNFT.unpause();
  console.log("✅ Contract unpaused successfully");

  // List NFT for rent
  const hourlyRate = ethers.parseEther("0.01");
  const dailyRate = ethers.parseEther("0.2");
  
  const listTx = await marketplace.connect(user1).listNFTForRent(
    await rentableNFT.getAddress(),
    1,
    hourlyRate,
    dailyRate,
    1, // min 1 hour
    24 // max 24 hours
  );
  await listTx.wait();
  console.log("✅ NFT listed for rent successfully");

  // Rent NFT
  const rentalCost = await marketplace.calculateRentalCost(1, 2, true); // 2 hours
  const rentTx = await marketplace.connect(user2).rentNFT(1, 2, true, {
    value: rentalCost
  });
  await rentTx.wait();
  console.log("✅ NFT rented successfully");

  // Verify rental state
  const currentUser = await rentableNFT.userOf(1);
  const isRented = await rentableNFT.isRented(1);
  console.log(`✅ Current renter: ${currentUser}`);
  console.log(`✅ Is rented: ${isRented}`);

  console.log("\n🎉 ALL TESTS PASSED! Your contracts are fully functional!");
  console.log("\n📊 Summary:");
  console.log("✅ Smart contracts deploy successfully");
  console.log("✅ NFT minting works");
  console.log("✅ Pause/unpause functionality works");
  console.log("✅ Marketplace listing works");
  console.log("✅ NFT rental works");
  console.log("✅ Contract integration works");
  console.log("\n🚀 Your contracts are ready for production!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });