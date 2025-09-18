// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./RentableNFT.sol";

/**
 * @title NFTRentalMarketplace
 * @dev Marketplace for renting NFTs with hourly and daily rates
 */
contract NFTRentalMarketplace is Ownable, ReentrancyGuard, Pausable {
    
    struct RentalListing {
        address nftContract;
        uint256 tokenId;
        address owner;
        uint256 hourlyRate;   // Rate per hour in wei
        uint256 dailyRate;    // Rate per day in wei
        bool isActive;
        uint256 minRentalHours;
        uint256 maxRentalHours;
    }

    struct RentalAgreement {
        address nftContract;
        uint256 tokenId;
        address owner;
        address renter;
        uint256 startTime;
        uint256 endTime;
        uint256 totalCost;
        bool isActive;
    }

    // Mapping from listing ID to rental listing
    mapping(uint256 => RentalListing) public rentalListings;
    
    // Mapping from rental ID to rental agreement
    mapping(uint256 => RentalAgreement) public rentalAgreements;
    
    // Mapping from NFT contract + token ID to listing ID
    mapping(address => mapping(uint256 => uint256)) public nftToListingId;
    
    // Mapping from NFT contract + token ID to active rental ID
    mapping(address => mapping(uint256 => uint256)) public nftToRentalId;

    uint256 private _listingIdCounter = 1;
    uint256 private _rentalIdCounter = 1;
    
    // Platform fee percentage (e.g., 250 = 2.5%)
    uint256 public platformFeePercent = 250;
    uint256 public constant MAX_PLATFORM_FEE = 1000; // 10% max
    uint256 public constant MIN_PLATFORM_FEE = 50;   // 0.5% min
    
    // Maximum rental duration (in hours) to prevent indefinite locks
    uint256 public constant MAX_RENTAL_DURATION = 24 * 30 * 6; // 6 months max

    event NFTListedForRent(
        uint256 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address owner,
        uint256 hourlyRate,
        uint256 dailyRate
    );

    event NFTRented(
        uint256 indexed rentalId,
        uint256 indexed listingId,
        address indexed renter,
        uint256 startTime,
        uint256 endTime,
        uint256 totalCost
    );

    event NFTReturned(
        uint256 indexed rentalId,
        address indexed nftContract,
        uint256 indexed tokenId
    );

    event ListingCancelled(uint256 indexed listingId);

    constructor(address initialOwner) Ownable(initialOwner) {
        require(initialOwner != address(0), "Owner cannot be zero address");
    }

    /**
     * @dev List an NFT for rent
     */
    function listNFTForRent(
        address nftContract,
        uint256 tokenId,
        uint256 hourlyRate,
        uint256 dailyRate,
        uint256 minRentalHours,
        uint256 maxRentalHours
    ) external nonReentrant whenNotPaused {
        require(nftContract != address(0), "Invalid NFT contract");
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not the owner");
        require(hourlyRate > 0 || dailyRate > 0, "Rate must be greater than 0");
        require(minRentalHours > 0 && maxRentalHours >= minRentalHours, "Invalid rental duration");
        require(maxRentalHours <= MAX_RENTAL_DURATION, "Rental duration too long");
        require(nftToListingId[nftContract][tokenId] == 0, "NFT already listed");
        
        // Check if NFT is currently rented
        RentableNFT rentableNFT = RentableNFT(nftContract);
        require(!rentableNFT.isRented(tokenId), "NFT is currently rented");

        uint256 listingId = _listingIdCounter++;
        
        rentalListings[listingId] = RentalListing({
            nftContract: nftContract,
            tokenId: tokenId,
            owner: msg.sender,
            hourlyRate: hourlyRate,
            dailyRate: dailyRate,
            isActive: true,
            minRentalHours: minRentalHours,
            maxRentalHours: maxRentalHours
        });

        nftToListingId[nftContract][tokenId] = listingId;

        emit NFTListedForRent(listingId, nftContract, tokenId, msg.sender, hourlyRate, dailyRate);
    }

    /**
     * @dev Rent an NFT
     */
    function rentNFT(
        uint256 listingId,
        uint256 rentalHours,
        bool useHourlyRate
    ) external payable nonReentrant whenNotPaused {
        RentalListing storage listing = rentalListings[listingId];
        require(listing.isActive, "Listing not active");
        require(rentalHours >= listing.minRentalHours && rentalHours <= listing.maxRentalHours, "Invalid rental duration");
        
        // Check if NFT is currently rented
        RentableNFT rentableNFT = RentableNFT(listing.nftContract);
        require(!rentableNFT.isRented(listing.tokenId), "NFT is currently rented");
        
        uint256 totalCost;
        if (useHourlyRate) {
            require(listing.hourlyRate > 0, "Hourly rate not available");
            totalCost = listing.hourlyRate * rentalHours;
        } else {
            require(listing.dailyRate > 0, "Daily rate not available");
            require(rentalHours % 24 == 0, "Daily rental must be in 24-hour increments");
            uint256 numDays = rentalHours / 24;
            totalCost = listing.dailyRate * numDays;
        }
        
        require(msg.value >= totalCost, "Insufficient payment");

        uint256 rentalId = _rentalIdCounter++;
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + (rentalHours * 1 hours);

        // Create rental agreement
        rentalAgreements[rentalId] = RentalAgreement({
            nftContract: listing.nftContract,
            tokenId: listing.tokenId,
            owner: listing.owner,
            renter: msg.sender,
            startTime: startTime,
            endTime: endTime,
            totalCost: totalCost,
            isActive: true
        });

        // Set user in the NFT contract
        rentableNFT.setUser(listing.tokenId, msg.sender, uint64(endTime));
        
        // Update mappings
        nftToRentalId[listing.nftContract][listing.tokenId] = rentalId;
        listing.isActive = false; // Disable listing while rented

        // Calculate platform fee and transfer payments
        uint256 platformFee = (totalCost * platformFeePercent) / 10000;
        uint256 ownerPayment = totalCost - platformFee;

        // Transfer payment to owner
        if (ownerPayment > 0) {
            payable(listing.owner).transfer(ownerPayment);
        }

        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }

        emit NFTRented(rentalId, listingId, msg.sender, startTime, endTime, totalCost);
    }

    /**
     * @dev Return an NFT (can be called by anyone after rental expires)
     */
    function returnNFT(uint256 rentalId) external nonReentrant {
        RentalAgreement storage rental = rentalAgreements[rentalId];
        require(rental.isActive, "Rental not active");
        require(block.timestamp >= rental.endTime, "Rental period not expired");

        // Clear user in the NFT contract
        RentableNFT rentableNFT = RentableNFT(rental.nftContract);
        rentableNFT.setUser(rental.tokenId, address(0), 0);

        // Reactivate listing
        uint256 listingId = nftToListingId[rental.nftContract][rental.tokenId];
        if (listingId != 0) {
            rentalListings[listingId].isActive = true;
        }

        // Clear mappings
        nftToRentalId[rental.nftContract][rental.tokenId] = 0;
        rental.isActive = false;

        emit NFTReturned(rentalId, rental.nftContract, rental.tokenId);
    }

    /**
     * @dev Cancel a rental listing (only by owner)
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        RentalListing storage listing = rentalListings[listingId];
        require(listing.owner == msg.sender, "Not the owner");
        require(listing.isActive, "Listing not active");
        
        // Check if NFT is currently rented
        RentableNFT rentableNFT = RentableNFT(listing.nftContract);
        require(!rentableNFT.isRented(listing.tokenId), "Cannot cancel while rented");

        listing.isActive = false;
        nftToListingId[listing.nftContract][listing.tokenId] = 0;

        emit ListingCancelled(listingId);
    }

    /**
     * @dev Get all active listings
     */
    function getActiveListings() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // First pass: count active listings
        for (uint256 i = 1; i < _listingIdCounter; i++) {
            if (rentalListings[i].isActive) {
                activeCount++;
            }
        }
        
        // Second pass: populate array
        uint256[] memory activeListings = new uint256[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i < _listingIdCounter; i++) {
            if (rentalListings[i].isActive) {
                activeListings[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return activeListings;
    }

    /**
     * @dev Get active listings with pagination (gas-optimized)
     */
    function getActiveListingsPaginated(uint256 offset, uint256 limit) external view returns (uint256[] memory, uint256) {
        require(limit > 0 && limit <= 100, "Invalid limit"); // Prevent gas issues
        
        uint256 totalActive = 0;
        uint256 collected = 0;
        uint256 skipped = 0;
        
        // Count total and collect within range
        uint256[] memory tempListings = new uint256[](limit);
        
        for (uint256 i = 1; i < _listingIdCounter && collected < limit; i++) {
            if (rentalListings[i].isActive) {
                totalActive++;
                if (skipped >= offset) {
                    tempListings[collected] = i;
                    collected++;
                } else {
                    skipped++;
                }
            }
        }
        
        // Continue counting remaining if needed
        for (uint256 i = skipped + offset + collected + 1; i < _listingIdCounter; i++) {
            if (rentalListings[i].isActive) {
                totalActive++;
            }
        }
        
        // Resize array to actual collected size
        uint256[] memory result = new uint256[](collected);
        for (uint256 i = 0; i < collected; i++) {
            result[i] = tempListings[i];
        }
        
        return (result, totalActive);
    }

    /**
     * @dev Get listings by owner
     */
    function getListingsByOwner(address owner) external view returns (uint256[] memory) {
        uint256 ownerCount = 0;
        
        // First pass: count owner's listings
        for (uint256 i = 1; i < _listingIdCounter; i++) {
            if (rentalListings[i].owner == owner && rentalListings[i].nftContract != address(0)) {
                ownerCount++;
            }
        }
        
        // Second pass: populate array
        uint256[] memory ownerListings = new uint256[](ownerCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i < _listingIdCounter; i++) {
            if (rentalListings[i].owner == owner && rentalListings[i].nftContract != address(0)) {
                ownerListings[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return ownerListings;
    }

    /**
     * @dev Get active rentals by renter
     */
    function getRentalsByRenter(address renter) external view returns (uint256[] memory) {
        uint256 renterCount = 0;
        
        // First pass: count renter's active rentals
        for (uint256 i = 1; i < _rentalIdCounter; i++) {
            if (rentalAgreements[i].renter == renter && rentalAgreements[i].isActive) {
                renterCount++;
            }
        }
        
        // Second pass: populate array
        uint256[] memory renterRentals = new uint256[](renterCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i < _rentalIdCounter; i++) {
            if (rentalAgreements[i].renter == renter && rentalAgreements[i].isActive) {
                renterRentals[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return renterRentals;
    }

    /**
     * @dev Set platform fee (only owner)
     */
    function setPlatformFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= MAX_PLATFORM_FEE, "Fee too high");
        require(_feePercent >= MIN_PLATFORM_FEE, "Fee too low");
        platformFeePercent = _feePercent;
    }

    /**
     * @dev Pause the contract (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Withdraw platform fees (only owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }

    /**
     * @dev Check if NFT is available for rent
     */
    function isAvailableForRent(address nftContract, uint256 tokenId) external view returns (bool) {
        uint256 listingId = nftToListingId[nftContract][tokenId];
        if (listingId == 0) return false;
        
        RentalListing storage listing = rentalListings[listingId];
        if (!listing.isActive) return false;
        
        RentableNFT rentableNFT = RentableNFT(nftContract);
        return !rentableNFT.isRented(tokenId);
    }

    /**
     * @dev Calculate rental cost
     */
    function calculateRentalCost(uint256 listingId, uint256 rentalHours, bool useHourlyRate) external view returns (uint256) {
        RentalListing storage listing = rentalListings[listingId];
        require(listing.nftContract != address(0), "Listing not found");
        
        if (useHourlyRate) {
            require(listing.hourlyRate > 0, "Hourly rate not available");
            return listing.hourlyRate * rentalHours;
        } else {
            require(listing.dailyRate > 0, "Daily rate not available");
            require(rentalHours % 24 == 0, "Daily rental must be in 24-hour increments");
            uint256 numDays = rentalHours / 24;
            return listing.dailyRate * numDays;
        }
    }
}