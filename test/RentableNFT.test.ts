import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { RentableNFT, NFTRentalMarketplace } from "../typechain-types";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("RentableNFT", function () {
  let rentableNFT: RentableNFT;
  let marketplace: NFTRentalMarketplace;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let renter: SignerWithAddress;

  const TEST_URI = "https://example.com/token/1";

  beforeEach(async function () {
    [owner, user1, user2, renter] = await ethers.getSigners();

    // Deploy RentableNFT
    const RentableNFTFactory = await ethers.getContractFactory("RentableNFT");
    rentableNFT = await RentableNFTFactory.deploy(owner.address);

    // Deploy Marketplace
    const MarketplaceFactory = await ethers.getContractFactory("NFTRentalMarketplace");
    marketplace = await MarketplaceFactory.deploy(owner.address);

    // Set marketplace in NFT contract
    await rentableNFT.setMarketplaceContract(await marketplace.getAddress());
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await rentableNFT.name()).to.equal("MetaLease NFT");
      expect(await rentableNFT.symbol()).to.equal("MLNFT");
    });

    it("Should set the correct owner", async function () {
      expect(await rentableNFT.owner()).to.equal(owner.address);
    });

    it("Should start with token counter at 1", async function () {
      expect(await rentableNFT.totalSupply()).to.equal(0);
    });

    it("Should reject deployment with zero address owner", async function () {
      const RentableNFTFactory = await ethers.getContractFactory("RentableNFT");
      
      await expect(
        RentableNFTFactory.deploy(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(RentableNFTFactory, "OwnableInvalidOwner");
    });
  });

  describe("Minting", function () {
    it("Should mint NFT and assign correct token ID", async function () {
      const tx = await rentableNFT.mint(user1.address, TEST_URI);
      const receipt = await tx.wait();

      expect(await rentableNFT.ownerOf(1)).to.equal(user1.address);
      expect(await rentableNFT.tokenURI(1)).to.equal(TEST_URI);
      expect(await rentableNFT.totalSupply()).to.equal(1);
    });

    it("Should increment token IDs correctly", async function () {
      await rentableNFT.mint(user1.address, TEST_URI);
      await rentableNFT.mint(user2.address, "https://example.com/token/2");

      expect(await rentableNFT.ownerOf(1)).to.equal(user1.address);
      expect(await rentableNFT.ownerOf(2)).to.equal(user2.address);
      expect(await rentableNFT.totalSupply()).to.equal(2);
    });

    it("Should allow anyone to mint", async function () {
      await rentableNFT.connect(user1).mint(user2.address, TEST_URI);
      expect(await rentableNFT.ownerOf(1)).to.equal(user2.address);
    });

    it("Should reject minting to zero address", async function () {
      await expect(
        rentableNFT.mint(ethers.ZeroAddress, TEST_URI)
      ).to.be.revertedWith("Cannot mint to zero address");
    });

    it("Should reject minting with empty URI", async function () {
      await expect(
        rentableNFT.mint(user1.address, "")
      ).to.be.revertedWith("URI cannot be empty");
    });

    it("Should reject minting when paused", async function () {
      await rentableNFT.pause();
      
      await expect(
        rentableNFT.mint(user1.address, TEST_URI)
      ).to.be.revertedWithCustomError(rentableNFT, "EnforcedPause");
    });
  });

  describe("Marketplace Integration", function () {
    it("Should set marketplace contract address", async function () {
      const newMarketplace = await ethers.getContractFactory("NFTRentalMarketplace");
      const newMarketplaceInstance = await newMarketplace.deploy(owner.address);

      await rentableNFT.setMarketplaceContract(await newMarketplaceInstance.getAddress());
      expect(await rentableNFT.marketplaceContract()).to.equal(await newMarketplaceInstance.getAddress());
    });

    it("Should only allow owner to set marketplace contract", async function () {
      const newMarketplace = await ethers.getContractFactory("NFTRentalMarketplace");
      const newMarketplaceInstance = await newMarketplace.deploy(owner.address);

      await expect(
        rentableNFT.connect(user1).setMarketplaceContract(await newMarketplaceInstance.getAddress())
      ).to.be.revertedWithCustomError(rentableNFT, "OwnableUnauthorizedAccount");
    });

    it("Should reject setting marketplace to zero address", async function () {
      await expect(
        rentableNFT.setMarketplaceContract(ethers.ZeroAddress)
      ).to.be.revertedWith("Marketplace cannot be zero address");
    });
  });

  describe("ERC4907 Rental Functionality", function () {
    let tokenId: number;
    let expirationTime: number;

    beforeEach(async function () {
      await rentableNFT.mint(user1.address, TEST_URI);
      tokenId = 1;
      expirationTime = (await time.latest()) + 3600; // 1 hour from now
    });

    it("Should set user and expiration by owner", async function () {
      await rentableNFT.connect(user1).setUser(tokenId, renter.address, expirationTime);

      expect(await rentableNFT.userOf(tokenId)).to.equal(renter.address);
      expect(await rentableNFT.userExpires(tokenId)).to.equal(expirationTime);
    });

    it("Should set user and expiration by marketplace", async function () {
      // Use owner to simulate marketplace call since marketplace contract will be calling setUser
      const marketplaceAddress = await marketplace.getAddress();
      
      // First, we need to impersonate the marketplace address
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [marketplaceAddress],
      });
      
      const marketplaceSigner = await ethers.getSigner(marketplaceAddress);
      
      await rentableNFT.connect(marketplaceSigner).setUser(tokenId, renter.address, expirationTime);

      expect(await rentableNFT.userOf(tokenId)).to.equal(renter.address);
      expect(await rentableNFT.userExpires(tokenId)).to.equal(expirationTime);
      
      await hre.network.provider.request({
        method: "hardhat_stopImpersonatingAccount",
        params: [marketplaceAddress],
      });
    });

    it("Should reject unauthorized user setting", async function () {
      await expect(
        rentableNFT.connect(user2).setUser(tokenId, renter.address, expirationTime)
      ).to.be.revertedWith("Not authorized");
    });

    it("Should return zero address for expired rental", async function () {
      await rentableNFT.connect(user1).setUser(tokenId, renter.address, expirationTime);

      // Fast forward past expiration
      await time.increaseTo(expirationTime + 1);

      expect(await rentableNFT.userOf(tokenId)).to.equal(ethers.ZeroAddress);
    });

    it("Should check if NFT is rented correctly", async function () {
      // Not rented initially
      expect(await rentableNFT.isRented(tokenId)).to.be.false;

      // Set user
      await rentableNFT.connect(user1).setUser(tokenId, renter.address, expirationTime);
      expect(await rentableNFT.isRented(tokenId)).to.be.true;

      // After expiration
      await time.increaseTo(expirationTime + 1);
      expect(await rentableNFT.isRented(tokenId)).to.be.false;
    });

    it("Should get current renter correctly", async function () {
      // No renter initially
      expect(await rentableNFT.getCurrentRenter(tokenId)).to.equal(ethers.ZeroAddress);

      // Set user
      await rentableNFT.connect(user1).setUser(tokenId, renter.address, expirationTime);
      expect(await rentableNFT.getCurrentRenter(tokenId)).to.equal(renter.address);

      // After expiration
      await time.increaseTo(expirationTime + 1);
      expect(await rentableNFT.getCurrentRenter(tokenId)).to.equal(ethers.ZeroAddress);
    });

    it("Should reject setting user when paused", async function () {
      await rentableNFT.pause();
      
      await expect(
        rentableNFT.connect(user1).setUser(tokenId, renter.address, expirationTime)
      ).to.be.revertedWithCustomError(rentableNFT, "EnforcedPause");
    });

    it("Should emit UpdateUser event", async function () {
      await expect(
        rentableNFT.connect(user1).setUser(tokenId, renter.address, expirationTime)
      )
        .to.emit(rentableNFT, "UpdateUser")
        .withArgs(tokenId, renter.address, expirationTime);
    });
  });

  describe("Transfer and Rental Clearing", function () {
    let tokenId: number;
    let expirationTime: number;

    beforeEach(async function () {
      await rentableNFT.mint(user1.address, TEST_URI);
      tokenId = 1;
      expirationTime = (await time.latest()) + 3600;
      await rentableNFT.connect(user1).setUser(tokenId, renter.address, expirationTime);
    });

    it("Should clear rental info on transfer", async function () {
      // Verify rental is set
      expect(await rentableNFT.userOf(tokenId)).to.equal(renter.address);

      // Transfer NFT
      await rentableNFT.connect(user1).transferFrom(user1.address, user2.address, tokenId);

      // Verify rental info is cleared
      expect(await rentableNFT.userOf(tokenId)).to.equal(ethers.ZeroAddress);
      expect(await rentableNFT.userExpires(tokenId)).to.equal(0);
    });

    it("Should emit UpdateUser event when clearing on transfer", async function () {
      await expect(
        rentableNFT.connect(user1).transferFrom(user1.address, user2.address, tokenId)
      )
        .to.emit(rentableNFT, "UpdateUser")
        .withArgs(tokenId, ethers.ZeroAddress, 0);
    });
  });

  describe("Token Management", function () {
    beforeEach(async function () {
      await rentableNFT.mint(user1.address, "https://example.com/1");
      await rentableNFT.mint(user1.address, "https://example.com/2");
      await rentableNFT.mint(user2.address, "https://example.com/3");
    });

    it("Should return correct tokens of owner", async function () {
      const user1Tokens = await rentableNFT.tokensOfOwner(user1.address);
      const user2Tokens = await rentableNFT.tokensOfOwner(user2.address);

      expect(user1Tokens.length).to.equal(2);
      expect(Number(user1Tokens[0])).to.equal(1);
      expect(Number(user1Tokens[1])).to.equal(2);

      expect(user2Tokens.length).to.equal(1);
      expect(Number(user2Tokens[0])).to.equal(3);
    });

    it("Should return empty array for address with no tokens", async function () {
      const emptyTokens = await rentableNFT.tokensOfOwner(renter.address);
      expect(emptyTokens.length).to.equal(0);
    });

    it("Should update tokens of owner after transfer", async function () {
      await rentableNFT.connect(user1).transferFrom(user1.address, user2.address, 1);

      const user1Tokens = await rentableNFT.tokensOfOwner(user1.address);
      const user2Tokens = await rentableNFT.tokensOfOwner(user2.address);

      expect(user1Tokens.length).to.equal(1);
      expect(Number(user1Tokens[0])).to.equal(2);

      expect(user2Tokens.length).to.equal(2);
      const user2TokenNumbers = user2Tokens.map(token => Number(token));
      expect(user2TokenNumbers).to.include(1);
      expect(user2TokenNumbers).to.include(3);
    });
  });

  describe("Interface Support", function () {
    it("Should support ERC4907 interface", async function () {
      const ERC4907InterfaceId = "0xad092b5c"; // ERC4907 interface ID
      expect(await rentableNFT.supportsInterface(ERC4907InterfaceId)).to.be.true;
    });

    it("Should support ERC721 interface", async function () {
      const ERC721InterfaceId = "0x80ac58cd";
      expect(await rentableNFT.supportsInterface(ERC721InterfaceId)).to.be.true;
    });

    it("Should support ERC165 interface", async function () {
      const ERC165InterfaceId = "0x01ffc9a7";
      expect(await rentableNFT.supportsInterface(ERC165InterfaceId)).to.be.true;
    });
  });

  describe("Edge Cases", function () {
    it("Should handle setting user to zero address", async function () {
      await rentableNFT.mint(user1.address, TEST_URI);
      const tokenId = 1;

      await rentableNFT.connect(user1).setUser(tokenId, ethers.ZeroAddress, 0);
      expect(await rentableNFT.userOf(tokenId)).to.equal(ethers.ZeroAddress);
    });

    it("Should handle setting expiration to 0", async function () {
      await rentableNFT.mint(user1.address, TEST_URI);
      const tokenId = 1;

      await rentableNFT.connect(user1).setUser(tokenId, renter.address, 0);
      expect(await rentableNFT.userOf(tokenId)).to.equal(ethers.ZeroAddress);
    });

    it("Should revert when querying non-existent token", async function () {
      await expect(rentableNFT.ownerOf(999)).to.be.revertedWithCustomError(
        rentableNFT,
        "ERC721NonexistentToken"
      );
    });

    it("Should handle multiple pause/unpause cycles", async function () {
      // Multiple pause/unpause cycles
      await rentableNFT.pause();
      expect(await rentableNFT.paused()).to.be.true;
      
      await rentableNFT.unpause();
      expect(await rentableNFT.paused()).to.be.false;
      
      await rentableNFT.pause();
      expect(await rentableNFT.paused()).to.be.true;
      
      await rentableNFT.unpause();
      expect(await rentableNFT.paused()).to.be.false;
      
      // Should still work normally
      await rentableNFT.mint(user1.address, TEST_URI);
      expect(await rentableNFT.ownerOf(1)).to.equal(user1.address);
    });

    it("Should handle large token IDs correctly", async function () {
      // Mint several tokens to test counter
      for (let i = 0; i < 10; i++) {
        await rentableNFT.mint(user1.address, `${TEST_URI}/${i}`);
      }
      
      expect(await rentableNFT.totalSupply()).to.equal(10);
      expect(await rentableNFT.ownerOf(10)).to.equal(user1.address);
    });
  });
});