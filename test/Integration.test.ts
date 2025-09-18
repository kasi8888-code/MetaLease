import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { RentableNFT, NFTRentalMarketplace } from "../typechain-types";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Integration Tests", function () {
  let rentableNFT: RentableNFT;
  let marketplace: NFTRentalMarketplace;
  let owner: SignerWithAddress;
  let alice: SignerWithAddress; // NFT owner
  let bob: SignerWithAddress;   // Renter
  let charlie: SignerWithAddress; // Another user

  const TEST_URI = "https://example.com/metadata/";
  const HOURLY_RATE = ethers.parseEther("0.01");
  const DAILY_RATE = ethers.parseEther("0.2");

  beforeEach(async function () {
    [owner, alice, bob, charlie] = await ethers.getSigners();

    // Deploy both contracts
    const RentableNFTFactory = await ethers.getContractFactory("RentableNFT");
    rentableNFT = await RentableNFTFactory.deploy(owner.address);

    const MarketplaceFactory = await ethers.getContractFactory("NFTRentalMarketplace");
    marketplace = await MarketplaceFactory.deploy(owner.address);

    // Connect the contracts
    await rentableNFT.setMarketplaceContract(await marketplace.getAddress());
  });

  describe("Complete Rental Lifecycle", function () {
    it("Should complete full rental cycle: mint -> list -> rent -> return", async function () {
      // 1. Mint NFT
      await rentableNFT.connect(alice).mint(alice.address, TEST_URI + "1");
      expect(await rentableNFT.ownerOf(1)).to.equal(alice.address);

      // 2. List NFT for rent
      await marketplace.connect(alice).listNFTForRent(
        await rentableNFT.getAddress(),
        1,
        HOURLY_RATE,
        DAILY_RATE,
        1, // min 1 hour
        24 // max 24 hours
      );

      const listing = await marketplace.rentalListings(1);
      expect(listing.isActive).to.be.true;
      expect(listing.owner).to.equal(alice.address);

      // 3. Rent NFT
      const rentalCost = await marketplace.calculateRentalCost(1, 3, true); // 3 hours
      const aliceBalanceBefore = await ethers.provider.getBalance(alice.address);

      await marketplace.connect(bob).rentNFT(1, 3, true, {
        value: rentalCost
      });

      // Verify rental state
      expect(await rentableNFT.userOf(1)).to.equal(bob.address);
      expect(await rentableNFT.isRented(1)).to.be.true;
      
      const rental = await marketplace.rentalAgreements(1);
      expect(rental.renter).to.equal(bob.address);
      expect(rental.isActive).to.be.true;

      // Verify payment (minus platform fee)
      const aliceBalanceAfter = await ethers.provider.getBalance(alice.address);
      const platformFee = (rentalCost * BigInt(250)) / BigInt(10000);
      const expectedPayment = rentalCost - platformFee;
      expect(aliceBalanceAfter - aliceBalanceBefore).to.equal(expectedPayment);

      // 4. Time passes, rental expires
      await time.increase(3 * 3600 + 1); // 3 hours + 1 second

      // 5. Return NFT
      await marketplace.connect(charlie).returnNFT(1); // Anyone can return

      // Verify final state
      expect(await rentableNFT.userOf(1)).to.equal(ethers.ZeroAddress);
      expect(await rentableNFT.isRented(1)).to.be.false;
      
      const finalRental = await marketplace.rentalAgreements(1);
      expect(finalRental.isActive).to.be.false;
      
      const finalListing = await marketplace.rentalListings(1);
      expect(finalListing.isActive).to.be.true; // Reactivated for new rentals
    });

    it("Should handle multiple NFTs and concurrent rentals", async function () {
      // Mint multiple NFTs
      await rentableNFT.connect(alice).mint(alice.address, TEST_URI + "1");
      await rentableNFT.connect(alice).mint(alice.address, TEST_URI + "2");
      await rentableNFT.connect(charlie).mint(charlie.address, TEST_URI + "3");

      // List all NFTs
      await marketplace.connect(alice).listNFTForRent(
        await rentableNFT.getAddress(), 1, HOURLY_RATE, DAILY_RATE, 1, 48
      );
      await marketplace.connect(alice).listNFTForRent(
        await rentableNFT.getAddress(), 2, HOURLY_RATE * BigInt(2), DAILY_RATE * BigInt(2), 1, 48
      );
      await marketplace.connect(charlie).listNFTForRent(
        await rentableNFT.getAddress(), 3, HOURLY_RATE / BigInt(2), DAILY_RATE / BigInt(2), 1, 24
      );

      // Rent multiple NFTs
      const cost1 = await marketplace.calculateRentalCost(1, 2, true);
      const cost2 = await marketplace.calculateRentalCost(2, 1, true);

      await marketplace.connect(bob).rentNFT(1, 2, true, { value: cost1 });
      await marketplace.connect(bob).rentNFT(2, 1, true, { value: cost2 });

      // Verify states
      expect(await rentableNFT.userOf(1)).to.equal(bob.address);
      expect(await rentableNFT.userOf(2)).to.equal(bob.address);
      expect(await rentableNFT.userOf(3)).to.equal(ethers.ZeroAddress);

      // Check Bob's rentals
      const bobRentals = await marketplace.getRentalsByRenter(bob.address);
      expect(bobRentals.length).to.equal(2);

      // Check Alice's listings
      const aliceListings = await marketplace.getListingsByOwner(alice.address);
      expect(aliceListings.length).to.equal(2);
    });
  });

  describe("Permission and Access Control", function () {
    beforeEach(async function () {
      await rentableNFT.connect(alice).mint(alice.address, TEST_URI + "1");
    });

    it("Should prevent unauthorized marketplace operations", async function () {
      // Try to set user without marketplace approval
      await expect(
        rentableNFT.connect(bob).setUser(1, bob.address, (await time.latest()) + 3600)
      ).to.be.revertedWith("Not authorized");

      // Only owner or marketplace can set user
      await rentableNFT.connect(alice).setUser(1, bob.address, (await time.latest()) + 3600);
      expect(await rentableNFT.userOf(1)).to.equal(bob.address);
    });

    it("Should handle marketplace contract updates", async function () {
      // Deploy new marketplace
      const NewMarketplaceFactory = await ethers.getContractFactory("NFTRentalMarketplace");
      const newMarketplace = await NewMarketplaceFactory.deploy(owner.address);

      // Only owner can update marketplace
      await expect(
        rentableNFT.connect(alice).setMarketplaceContract(await newMarketplace.getAddress())
      ).to.be.revertedWithCustomError(rentableNFT, "OwnableUnauthorizedAccount");

      // Update marketplace
      await rentableNFT.setMarketplaceContract(await newMarketplace.getAddress());
      
      // Old marketplace should no longer have access
      await expect(
        marketplace.connect(alice).listNFTForRent(
          await rentableNFT.getAddress(), 1, HOURLY_RATE, DAILY_RATE, 1, 24
        )
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Edge Cases and Error Handling", function () {
    beforeEach(async function () {
      await rentableNFT.connect(alice).mint(alice.address, TEST_URI + "1");
      await marketplace.connect(alice).listNFTForRent(
        await rentableNFT.getAddress(), 1, HOURLY_RATE, DAILY_RATE, 1, 24
      );
    });

    it("Should handle NFT transfer during active rental", async function () {
      // Rent NFT
      const rentalCost = await marketplace.calculateRentalCost(1, 2, true);
      await marketplace.connect(bob).rentNFT(1, 2, true, { value: rentalCost });

      // Verify rental is active
      expect(await rentableNFT.userOf(1)).to.equal(bob.address);

      // Transfer NFT (should clear rental info)
      await rentableNFT.connect(alice).transferFrom(alice.address, charlie.address, 1);

      // Rental info should be cleared
      expect(await rentableNFT.userOf(1)).to.equal(ethers.ZeroAddress);
      expect(await rentableNFT.isRented(1)).to.be.false;

      // But marketplace rental agreement should still exist
      const rental = await marketplace.rentalAgreements(1);
      expect(rental.isActive).to.be.true;
    });

    it("Should handle expired rentals gracefully", async function () {
      // Rent NFT
      const rentalCost = await marketplace.calculateRentalCost(1, 1, true);
      await marketplace.connect(bob).rentNFT(1, 1, true, { value: rentalCost });

      // Fast forward past expiration
      await time.increase(3600 + 1);

      // NFT should show as not rented
      expect(await rentableNFT.userOf(1)).to.equal(ethers.ZeroAddress);
      expect(await rentableNFT.isRented(1)).to.be.false;

      // But marketplace still shows active until returned
      const rental = await marketplace.rentalAgreements(1);
      expect(rental.isActive).to.be.true;

      // Return should work
      await marketplace.returnNFT(1);
      const finalRental = await marketplace.rentalAgreements(1);
      expect(finalRental.isActive).to.be.false;
    });

    it("Should handle zero payment scenarios", async function () {
      // Try to rent with zero payment
      await expect(
        marketplace.connect(bob).rentNFT(1, 1, true, { value: 0 })
      ).to.be.revertedWith("Insufficient payment");

      // Create listing with zero rates (should fail)
      await rentableNFT.connect(alice).mint(alice.address, TEST_URI + "2");
      await expect(
        marketplace.connect(alice).listNFTForRent(
          await rentableNFT.getAddress(), 2, 0, 0, 1, 24
        )
      ).to.be.revertedWith("Rate must be greater than 0");
    });
  });

  describe("Fee Management and Payments", function () {
    beforeEach(async function () {
      await rentableNFT.connect(alice).mint(alice.address, TEST_URI + "1");
      await marketplace.connect(alice).listNFTForRent(
        await rentableNFT.getAddress(), 1, HOURLY_RATE, DAILY_RATE, 1, 24
      );
    });

    it("Should handle platform fee changes", async function () {
      // Change platform fee
      await marketplace.connect(owner).setPlatformFee(500); // 5%

      const rentalCost = await marketplace.calculateRentalCost(1, 1, true);
      const aliceBalanceBefore = await ethers.provider.getBalance(alice.address);

      await marketplace.connect(bob).rentNFT(1, 1, true, { value: rentalCost });

      const aliceBalanceAfter = await ethers.provider.getBalance(alice.address);
      const platformFee = (rentalCost * BigInt(500)) / BigInt(10000); // 5%
      const expectedPayment = rentalCost - platformFee;

      expect(aliceBalanceAfter - aliceBalanceBefore).to.equal(expectedPayment);
    });

    it("Should accumulate and withdraw fees correctly", async function () {
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      
      // Multiple rentals to accumulate fees
      const rentalCost = await marketplace.calculateRentalCost(1, 1, true);
      await marketplace.connect(bob).rentNFT(1, 1, true, { value: rentalCost });

      // Fast forward and return
      await time.increase(3601);
      await marketplace.returnNFT(1);

      // Rent again
      await marketplace.connect(bob).rentNFT(1, 1, true, { value: rentalCost });

      const totalFees = (rentalCost * BigInt(250) * BigInt(2)) / BigInt(10000); // 2.5% of 2 rentals

      // Withdraw fees
      const tx = await marketplace.connect(owner).withdrawFees();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      expect(ownerBalanceAfter - ownerBalanceBefore + gasUsed).to.equal(totalFees);
    });
  });

  describe("Data Integrity and State Management", function () {
    it("Should maintain consistent state across operations", async function () {
      // Create comprehensive scenario
      await rentableNFT.connect(alice).mint(alice.address, TEST_URI + "1");
      await rentableNFT.connect(alice).mint(alice.address, TEST_URI + "2");

      // List both NFTs
      await marketplace.connect(alice).listNFTForRent(
        await rentableNFT.getAddress(), 1, HOURLY_RATE, DAILY_RATE, 1, 24
      );
      await marketplace.connect(alice).listNFTForRent(
        await rentableNFT.getAddress(), 2, HOURLY_RATE, DAILY_RATE, 1, 24
      );

      // Verify initial state
      expect(await marketplace.isAvailableForRent(await rentableNFT.getAddress(), 1)).to.be.true;
      expect(await marketplace.isAvailableForRent(await rentableNFT.getAddress(), 2)).to.be.true;

      // Rent one NFT
      const cost1 = await marketplace.calculateRentalCost(1, 2, true);
      await marketplace.connect(bob).rentNFT(1, 2, true, { value: cost1 });

      // Verify state changes
      expect(await marketplace.isAvailableForRent(await rentableNFT.getAddress(), 1)).to.be.false;
      expect(await marketplace.isAvailableForRent(await rentableNFT.getAddress(), 2)).to.be.true;

      // Check listings and rentals
      const activeListings = await marketplace.getActiveListings();
      expect(activeListings).to.include(2); // NFT 2 still available
      expect(activeListings).to.not.include(1); // NFT 1 rented

      const bobRentals = await marketplace.getRentalsByRenter(bob.address);
      expect(bobRentals.length).to.equal(1);

      // Return and verify state restoration
      await time.increase(2 * 3600 + 1);
      await marketplace.returnNFT(1);

      const finalActiveListings = await marketplace.getActiveListings();
      expect(finalActiveListings).to.include(1); // NFT 1 available again
      expect(finalActiveListings).to.include(2); // NFT 2 still available

      const finalBobRentals = await marketplace.getRentalsByRenter(bob.address);
      expect(finalBobRentals.length).to.equal(0); // No active rentals
    });
  });
});