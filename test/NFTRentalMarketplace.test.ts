import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { RentableNFT, NFTRentalMarketplace } from "../typechain-types";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("NFTRentalMarketplace", function () {
  let rentableNFT: RentableNFT;
  let marketplace: NFTRentalMarketplace;
  let owner: SignerWithAddress;
  let nftOwner: SignerWithAddress;
  let renter: SignerWithAddress;
  let otherUser: SignerWithAddress;

  const TEST_URI = "https://example.com/token/1";
  const HOURLY_RATE = ethers.parseEther("0.01"); // 0.01 ETH per hour
  const DAILY_RATE = ethers.parseEther("0.2"); // 0.2 ETH per day
  const MIN_RENTAL_HOURS = 1;
  const MAX_RENTAL_HOURS = 24 * 7; // 1 week

  beforeEach(async function () {
    [owner, nftOwner, renter, otherUser] = await ethers.getSigners();

    // Deploy contracts
    const RentableNFTFactory = await ethers.getContractFactory("RentableNFT");
    rentableNFT = await RentableNFTFactory.deploy(owner.address);

    const MarketplaceFactory = await ethers.getContractFactory("NFTRentalMarketplace");
    marketplace = await MarketplaceFactory.deploy(owner.address);

    // Set marketplace in NFT contract
    await rentableNFT.setMarketplaceContract(await marketplace.getAddress());

    // Mint an NFT for testing
    await rentableNFT.mint(nftOwner.address, TEST_URI);
  });

  describe("Deployment", function () {
    it("Should set correct owner", async function () {
      expect(await marketplace.owner()).to.equal(owner.address);
    });

    it("Should set default platform fee", async function () {
      expect(await marketplace.platformFeePercent()).to.equal(250); // 2.5%
    });

    it("Should start with counter at 1", async function () {
      const activeListings = await marketplace.getActiveListings();
      expect(activeListings.length).to.equal(0);
    });
  });

  describe("Listing NFTs", function () {
    it("Should list NFT for rent successfully", async function () {
      const tx = await marketplace.connect(nftOwner).listNFTForRent(
        await rentableNFT.getAddress(),
        1,
        HOURLY_RATE,
        DAILY_RATE,
        MIN_RENTAL_HOURS,
        MAX_RENTAL_HOURS
      );

      await expect(tx)
        .to.emit(marketplace, "NFTListedForRent")
        .withArgs(1, await rentableNFT.getAddress(), 1, nftOwner.address, HOURLY_RATE, DAILY_RATE);

      const listing = await marketplace.rentalListings(1);
      expect(listing.nftContract).to.equal(await rentableNFT.getAddress());
      expect(listing.tokenId).to.equal(1);
      expect(listing.owner).to.equal(nftOwner.address);
      expect(listing.hourlyRate).to.equal(HOURLY_RATE);
      expect(listing.dailyRate).to.equal(DAILY_RATE);
      expect(listing.isActive).to.be.true;
    });

    it("Should reject listing by non-owner", async function () {
      await expect(
        marketplace.connect(renter).listNFTForRent(
          await rentableNFT.getAddress(),
          1,
          HOURLY_RATE,
          DAILY_RATE,
          MIN_RENTAL_HOURS,
          MAX_RENTAL_HOURS
        )
      ).to.be.revertedWith("Not the owner");
    });

    it("Should reject listing with zero rates", async function () {
      await expect(
        marketplace.connect(nftOwner).listNFTForRent(
          await rentableNFT.getAddress(),
          1,
          0,
          0,
          MIN_RENTAL_HOURS,
          MAX_RENTAL_HOURS
        )
      ).to.be.revertedWith("Rate must be greater than 0");
    });

    it("Should reject invalid rental duration", async function () {
      await expect(
        marketplace.connect(nftOwner).listNFTForRent(
          await rentableNFT.getAddress(),
          1,
          HOURLY_RATE,
          DAILY_RATE,
          0, // Invalid min hours
          MAX_RENTAL_HOURS
        )
      ).to.be.revertedWith("Invalid rental duration");

      await expect(
        marketplace.connect(nftOwner).listNFTForRent(
          await rentableNFT.getAddress(),
          1,
          HOURLY_RATE,
          DAILY_RATE,
          MAX_RENTAL_HOURS + 1, // Min > Max
          MAX_RENTAL_HOURS
        )
      ).to.be.revertedWith("Invalid rental duration");
    });

    it("Should reject double listing", async function () {
      await marketplace.connect(nftOwner).listNFTForRent(
        await rentableNFT.getAddress(),
        1,
        HOURLY_RATE,
        DAILY_RATE,
        MIN_RENTAL_HOURS,
        MAX_RENTAL_HOURS
      );

      await expect(
        marketplace.connect(nftOwner).listNFTForRent(
          await rentableNFT.getAddress(),
          1,
          HOURLY_RATE,
          DAILY_RATE,
          MIN_RENTAL_HOURS,
          MAX_RENTAL_HOURS
        )
      ).to.be.revertedWith("NFT already listed");
    });

    it("Should reject listing currently rented NFT", async function () {
      // First list and rent the NFT
      await marketplace.connect(nftOwner).listNFTForRent(
        await rentableNFT.getAddress(),
        1,
        HOURLY_RATE,
        DAILY_RATE,
        MIN_RENTAL_HOURS,
        MAX_RENTAL_HOURS
      );

      const rentalCost = await marketplace.calculateRentalCost(1, 2, true);
      await marketplace.connect(renter).rentNFT(1, 2, true, { value: rentalCost });

      // Try to list again - should fail
      await expect(
        marketplace.connect(nftOwner).listNFTForRent(
          await rentableNFT.getAddress(),
          1,
          HOURLY_RATE,
          DAILY_RATE,
          MIN_RENTAL_HOURS,
          MAX_RENTAL_HOURS
        )
      ).to.be.revertedWith("NFT already listed");
    });
  });

  describe("Renting NFTs", function () {
    beforeEach(async function () {
      await marketplace.connect(nftOwner).listNFTForRent(
        await rentableNFT.getAddress(),
        1,
        HOURLY_RATE,
        DAILY_RATE,
        MIN_RENTAL_HOURS,
        MAX_RENTAL_HOURS
      );
    });

    it("Should rent NFT with hourly rate", async function () {
      const rentalHours = 5;
      const expectedCost = HOURLY_RATE * BigInt(rentalHours);

      const tx = await marketplace.connect(renter).rentNFT(1, rentalHours, true, {
        value: expectedCost
      });

      const currentTime = await time.latest();
      const expectedEndTime = currentTime + (rentalHours * 3600);

      await expect(tx)
        .to.emit(marketplace, "NFTRented")
        .withArgs(1, 1, renter.address, currentTime + 1, expectedEndTime + 1, expectedCost);

      // Check rental agreement
      const rental = await marketplace.rentalAgreements(1);
      expect(rental.renter).to.equal(renter.address);
      expect(rental.totalCost).to.equal(expectedCost);
      expect(rental.isActive).to.be.true;

      // Check NFT user is set
      expect(await rentableNFT.userOf(1)).to.equal(renter.address);

      // Check listing is deactivated
      const listing = await marketplace.rentalListings(1);
      expect(listing.isActive).to.be.false;
    });

    it("Should rent NFT with daily rate", async function () {
      const rentalHours = 48; // 2 days
      const expectedDays = 2;
      const expectedCost = DAILY_RATE * BigInt(expectedDays);

      await marketplace.connect(renter).rentNFT(1, rentalHours, false, {
        value: expectedCost
      });

      const rental = await marketplace.rentalAgreements(1);
      expect(rental.totalCost).to.equal(expectedCost);
    });

    it("Should reject daily rental not in 24-hour increments", async function () {
      await expect(
        marketplace.connect(renter).rentNFT(1, 25, false, { // 25 hours, not divisible by 24
          value: DAILY_RATE
        })
      ).to.be.revertedWith("Daily rental must be in 24-hour increments");
    });

    it("Should reject insufficient payment", async function () {
      const rentalHours = 2;
      const requiredCost = HOURLY_RATE * BigInt(rentalHours);
      const insufficientPayment = requiredCost - BigInt(1);

      await expect(
        marketplace.connect(renter).rentNFT(1, rentalHours, true, {
          value: insufficientPayment
        })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should refund excess payment", async function () {
      const rentalHours = 1;
      const requiredCost = HOURLY_RATE * BigInt(rentalHours);
      const excessPayment = requiredCost + ethers.parseEther("0.1");

      const initialBalance = await ethers.provider.getBalance(renter.address);
      
      const tx = await marketplace.connect(renter).rentNFT(1, rentalHours, true, {
        value: excessPayment
      });
      
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const finalBalance = await ethers.provider.getBalance(renter.address);

      // Should only pay the required cost plus gas
      const expectedBalance = initialBalance - requiredCost - gasUsed;
      expect(finalBalance).to.equal(expectedBalance);
    });

    it("Should handle platform fee correctly", async function () {
      const rentalHours = 1;
      const totalCost = HOURLY_RATE * BigInt(rentalHours);
      const platformFee = (totalCost * BigInt(250)) / BigInt(10000); // 2.5%
      const ownerPayment = totalCost - platformFee;

      const ownerInitialBalance = await ethers.provider.getBalance(nftOwner.address);
      const marketplaceInitialBalance = await ethers.provider.getBalance(await marketplace.getAddress());

      await marketplace.connect(renter).rentNFT(1, rentalHours, true, {
        value: totalCost
      });

      const ownerFinalBalance = await ethers.provider.getBalance(nftOwner.address);
      const marketplaceFinalBalance = await ethers.provider.getBalance(await marketplace.getAddress());

      expect(ownerFinalBalance - ownerInitialBalance).to.equal(ownerPayment);
      expect(marketplaceFinalBalance - marketplaceInitialBalance).to.equal(platformFee);
    });

    it("Should reject rental outside duration bounds", async function () {
      // Too short
      await expect(
        marketplace.connect(renter).rentNFT(1, 0, true, {
          value: HOURLY_RATE
        })
      ).to.be.revertedWith("Invalid rental duration");

      // Too long
      const tooLong = MAX_RENTAL_HOURS + 1;
      await expect(
        marketplace.connect(renter).rentNFT(1, tooLong, true, {
          value: HOURLY_RATE * BigInt(tooLong)
        })
      ).to.be.revertedWith("Invalid rental duration");
    });

    it("Should reject renting already rented NFT", async function () {
      const rentalCost = await marketplace.calculateRentalCost(1, 1, true);
      
      // First rental
      await marketplace.connect(renter).rentNFT(1, 1, true, {
        value: rentalCost
      });

      // Try to rent again
      await expect(
        marketplace.connect(otherUser).rentNFT(1, 1, true, {
          value: rentalCost
        })
      ).to.be.revertedWith("NFT is currently rented");
    });
  });

  describe("Returning NFTs", function () {
    let rentalId: number;

    beforeEach(async function () {
      await marketplace.connect(nftOwner).listNFTForRent(
        await rentableNFT.getAddress(),
        1,
        HOURLY_RATE,
        DAILY_RATE,
        MIN_RENTAL_HOURS,
        MAX_RENTAL_HOURS
      );

      const rentalCost = await marketplace.calculateRentalCost(1, 2, true);
      await marketplace.connect(renter).rentNFT(1, 2, true, { value: rentalCost });
      rentalId = 1;
    });

    it("Should not allow return before rental expires", async function () {
      await expect(
        marketplace.connect(renter).returnNFT(rentalId)
      ).to.be.revertedWith("Rental period not expired");
    });

    it("Should allow return after rental expires", async function () {
      // Fast forward past rental period
      await time.increase(2 * 3600 + 1); // 2 hours + 1 second

      const tx = await marketplace.returnNFT(rentalId);
      
      await expect(tx)
        .to.emit(marketplace, "NFTReturned")
        .withArgs(rentalId, await rentableNFT.getAddress(), 1);

      // Check rental is deactivated
      const rental = await marketplace.rentalAgreements(rentalId);
      expect(rental.isActive).to.be.false;

      // Check NFT user is cleared
      expect(await rentableNFT.userOf(1)).to.equal(ethers.ZeroAddress);

      // Check listing is reactivated
      const listing = await marketplace.rentalListings(1);
      expect(listing.isActive).to.be.true;
    });

    it("Should allow anyone to return expired rental", async function () {
      await time.increase(2 * 3600 + 1);
      
      // Other user can return
      await marketplace.connect(otherUser).returnNFT(rentalId);
      
      const rental = await marketplace.rentalAgreements(rentalId);
      expect(rental.isActive).to.be.false;
    });

    it("Should reject returning inactive rental", async function () {
      await time.increase(2 * 3600 + 1);
      await marketplace.returnNFT(rentalId);

      // Try to return again
      await expect(
        marketplace.returnNFT(rentalId)
      ).to.be.revertedWith("Rental not active");
    });
  });

  describe("Listing Management", function () {
    beforeEach(async function () {
      await marketplace.connect(nftOwner).listNFTForRent(
        await rentableNFT.getAddress(),
        1,
        HOURLY_RATE,
        DAILY_RATE,
        MIN_RENTAL_HOURS,
        MAX_RENTAL_HOURS
      );
    });

    it("Should cancel listing by owner", async function () {
      const tx = await marketplace.connect(nftOwner).cancelListing(1);
      
      await expect(tx).to.emit(marketplace, "ListingCancelled").withArgs(1);

      const listing = await marketplace.rentalListings(1);
      expect(listing.isActive).to.be.false;
    });

    it("Should reject cancelling by non-owner", async function () {
      await expect(
        marketplace.connect(renter).cancelListing(1)
      ).to.be.revertedWith("Not the owner");
    });

    it("Should reject cancelling inactive listing", async function () {
      await marketplace.connect(nftOwner).cancelListing(1);
      
      await expect(
        marketplace.connect(nftOwner).cancelListing(1)
      ).to.be.revertedWith("Listing not active");
    });

    it("Should reject cancelling rented NFT listing", async function () {
      const rentalCost = await marketplace.calculateRentalCost(1, 1, true);
      await marketplace.connect(renter).rentNFT(1, 1, true, { value: rentalCost });

      await expect(
        marketplace.connect(nftOwner).cancelListing(1)
      ).to.be.revertedWith("Cannot cancel while rented");
    });
  });

  describe("Platform Management", function () {
    it("Should set platform fee", async function () {
      const newFee = 500; // 5%
      await marketplace.connect(owner).setPlatformFee(newFee);
      expect(await marketplace.platformFeePercent()).to.equal(newFee);
    });

    it("Should reject fee higher than maximum", async function () {
      const tooHighFee = 1001; // 10.01%
      await expect(
        marketplace.connect(owner).setPlatformFee(tooHighFee)
      ).to.be.revertedWith("Fee too high");
    });

    it("Should reject fee setting by non-owner", async function () {
      await expect(
        marketplace.connect(renter).setPlatformFee(300)
      ).to.be.revertedWithCustomError(marketplace, "OwnableUnauthorizedAccount");
    });

    it("Should withdraw fees", async function () {
      // Create rental to generate fees
      await marketplace.connect(nftOwner).listNFTForRent(
        await rentableNFT.getAddress(),
        1,
        HOURLY_RATE,
        DAILY_RATE,
        MIN_RENTAL_HOURS,
        MAX_RENTAL_HOURS
      );

      const rentalCost = await marketplace.calculateRentalCost(1, 1, true);
      await marketplace.connect(renter).rentNFT(1, 1, true, { value: rentalCost });

      const expectedFee = (rentalCost * BigInt(250)) / BigInt(10000);
      const ownerInitialBalance = await ethers.provider.getBalance(owner.address);

      const tx = await marketplace.connect(owner).withdrawFees();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const ownerFinalBalance = await ethers.provider.getBalance(owner.address);
      expect(ownerFinalBalance - ownerInitialBalance + gasUsed).to.equal(expectedFee);
    });

    it("Should reject withdrawal with no fees", async function () {
      await expect(
        marketplace.connect(owner).withdrawFees()
      ).to.be.revertedWith("No fees to withdraw");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      // Create multiple listings and rentals for testing
      await rentableNFT.mint(nftOwner.address, "https://example.com/2");
      await rentableNFT.mint(otherUser.address, "https://example.com/3");

      await marketplace.connect(nftOwner).listNFTForRent(
        await rentableNFT.getAddress(), 1, HOURLY_RATE, DAILY_RATE, MIN_RENTAL_HOURS, MAX_RENTAL_HOURS
      );
      await marketplace.connect(nftOwner).listNFTForRent(
        await rentableNFT.getAddress(), 2, HOURLY_RATE, DAILY_RATE, MIN_RENTAL_HOURS, MAX_RENTAL_HOURS
      );
      await marketplace.connect(otherUser).listNFTForRent(
        await rentableNFT.getAddress(), 3, HOURLY_RATE, DAILY_RATE, MIN_RENTAL_HOURS, MAX_RENTAL_HOURS
      );
    });

    it("Should get active listings", async function () {
      const activeListings = await marketplace.getActiveListings();
      expect(activeListings.length).to.equal(3);
      expect(activeListings).to.include(1);
      expect(activeListings).to.include(2);
      expect(activeListings).to.include(3);
    });

    it("Should get listings by owner", async function () {
      const nftOwnerListings = await marketplace.getListingsByOwner(nftOwner.address);
      const otherUserListings = await marketplace.getListingsByOwner(otherUser.address);

      expect(nftOwnerListings.length).to.equal(2);
      expect(nftOwnerListings).to.include(1);
      expect(nftOwnerListings).to.include(2);

      expect(otherUserListings.length).to.equal(1);
      expect(otherUserListings[0]).to.equal(3);
    });

    it("Should get rentals by renter", async function () {
      const rentalCost = await marketplace.calculateRentalCost(1, 1, true);
      await marketplace.connect(renter).rentNFT(1, 1, true, { value: rentalCost });

      const renterRentals = await marketplace.getRentalsByRenter(renter.address);
      expect(renterRentals.length).to.equal(1);
      expect(renterRentals[0]).to.equal(1);

      const otherUserRentals = await marketplace.getRentalsByRenter(otherUser.address);
      expect(otherUserRentals.length).to.equal(0);
    });

    it("Should check availability for rent", async function () {
      expect(await marketplace.isAvailableForRent(await rentableNFT.getAddress(), 1)).to.be.true;
      
      // Rent the NFT
      const rentalCost = await marketplace.calculateRentalCost(1, 1, true);
      await marketplace.connect(renter).rentNFT(1, 1, true, { value: rentalCost });
      
      expect(await marketplace.isAvailableForRent(await rentableNFT.getAddress(), 1)).to.be.false;
    });

    it("Should calculate rental cost correctly", async function () {
      // Hourly calculation
      const hourlyCost = await marketplace.calculateRentalCost(1, 5, true);
      expect(hourlyCost).to.equal(HOURLY_RATE * BigInt(5));

      // Daily calculation
      const dailyCost = await marketplace.calculateRentalCost(1, 48, false); // 2 days
      expect(dailyCost).to.equal(DAILY_RATE * BigInt(2));
    });

    it("Should reject cost calculation for non-existent listing", async function () {
      await expect(
        marketplace.calculateRentalCost(999, 1, true)
      ).to.be.revertedWith("Listing not found");
    });
  });
});