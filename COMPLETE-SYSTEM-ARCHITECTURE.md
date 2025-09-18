# 🎯 MetaLease System Architecture: Complete Flow from Image Upload to Rental

## 📋 System Overview

The MetaLease platform is a comprehensive NFT rental marketplace built on Ethereum (Sepolia testnet) that allows users to create, mint, list, and rent NFTs. Here's exactly how the system works from code perspective:

---

## 🔄 Complete Flow Breakdown

### **STEP 1: User Interface - NFT Creation** 
📁 **File**: `src/app/create/page.tsx`

**How it works:**
```tsx
// User uploads image via drag & drop
const onDrop = useCallback((acceptedFiles: File[]) => {
  const file = acceptedFiles[0];
  if (file) {
    setImageFile(file);
    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onload = () => setUploadedImage(reader.result as string);
    reader.readAsDataURL(file);
  }
}, []);

// Form submission triggers NFT creation
const handleSubmit = async (e: React.FormEvent) => {
  await createNFT(
    imageFile,           // The uploaded image file
    formData.name,       // NFT name
    formData.description,// NFT description  
    formData.attributes  // Traits like color, rarity, etc.
  );
};
```

**User Input Requirements:**
- Image file (PNG, JPG, GIF up to 10MB)
- NFT name and description  
- Optional attributes (trait_type, value pairs)
- Wallet connection to Sepolia testnet

---

### **STEP 2: IPFS Upload Process**
📁 **File**: `src/services/ipfs.ts`

**Image Upload to Pinata IPFS:**
```typescript
async uploadImageToIPFS(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  // Add Pinata metadata for tracking
  const pinataMetadata = JSON.stringify({
    name: `NFT-Image-${Date.now()}`,
    keyvalues: {
      type: 'nft-image',
      filename: file.name
    }
  });
  formData.append('pinataMetadata', pinataMetadata);

  // Upload to Pinata with JWT authentication
  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: this.getAuthHeaders(), // JWT Bearer token
    body: formData,
  });

  return result.IpfsHash; // Returns: "QmAbcd1234..."
}
```

**Metadata Upload to IPFS:**
```typescript
async uploadMetadataToIPFS(metadata: NFTMetadata): Promise<string> {
  const payload = {
    pinataContent: {
      name: "Cool NFT #1234",
      description: "Amazing digital art",
      image: "ipfs://QmImageHash123", // Links to uploaded image
      attributes: [
        { trait_type: "Color", value: "Blue" },
        { trait_type: "Rarity", value: "Epic" }
      ]
    },
    pinataMetadata: {
      name: `NFT-Metadata-${Date.now()}`,
      keyvalues: { type: 'nft-metadata', nft_name: metadata.name }
    }
  };

  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
    body: JSON.stringify(payload),
  });

  return result.IpfsHash; // Returns: "QmMetadata5678..."
}
```

---

### **STEP 3: Smart Contract Integration**
📁 **File**: `src/hooks/useBlockchainData.ts`

**Complete NFT Creation Hook:**
```typescript
export function useCreateNFT() {
  const createNFT = async (image: File, name: string, description: string, attributes: any[]) => {
    try {
      setUploadState({ stage: 'uploading-image' });
      
      // Step 1: Upload image to IPFS
      const imageHash = await ipfsService.uploadImageToIPFS(image);
      // Result: "QmImageABC123"
      
      setUploadState({ stage: 'uploading-metadata' });
      
      // Step 2: Create and upload metadata
      const metadata: NFTMetadata = {
        name,
        description,
        image: `ipfs://${imageHash}`, // Links to IPFS image
        attributes
      };
      const metadataHash = await ipfsService.uploadMetadataToIPFS(metadata);
      // Result: "QmMetadataXYZ789"

      setUploadState({ stage: 'minting' });
      
      // Step 3: Mint NFT on blockchain with metadata URI
      await mintNFT(`ipfs://${metadataHash}`);
      
      setUploadState({ stage: 'complete' });
    } catch (error) {
      throw error;
    }
  };
}
```

**Blockchain Minting Process:**
```typescript
const mintNFT = async (metadataURI: string) => {
  writeContract({
    address: CONTRACT_ADDRESSES.RENTABLE_NFT, // 0x4e35...76fd
    abi: RENTABLE_NFT_ABI,
    functionName: 'mintNFT',
    args: [
      '0x0000000000000000000000000000000000000000', // Zero address = mint to caller
      metadataURI // "ipfs://QmMetadataXYZ789"
    ],
    chainId: sepolia.id, // 11155111
  });
};
```

---

### **STEP 4: Smart Contract - NFT Minting**
📁 **File**: `contracts/RentableNFT.sol`

**On-chain NFT Creation:**
```solidity
function mint(address to, string memory uri) external whenNotPaused returns (uint256) {
    require(to != address(0), "Cannot mint to zero address");
    require(bytes(uri).length > 0, "URI cannot be empty");
    
    uint256 tokenId = _nextTokenId++; // Auto-increment: 1, 2, 3...
    
    _safeMint(to, tokenId);           // Mint NFT to user's wallet
    _setTokenURI(tokenId, uri);       // Set metadata URI: "ipfs://QmMetadata..."
    
    return tokenId; // Returns new token ID
}
```

**Result**: User now owns NFT with:
- Token ID: #1234
- Owner: User's wallet address
- Metadata URI: `ipfs://QmMetadataXYZ789`
- Status: Available for listing

---

### **STEP 5: Listing NFT for Rent**
📁 **File**: `src/app/create/page.tsx` (Rent tab)

**UI Listing Process:**
```tsx
const handleListForRent = async (e: React.FormEvent) => {
  await listNFT(
    createdTokenId,           // Token ID from minting
    rentalData.hourlyRate,    // "0.001" ETH per hour
    rentalData.dailyRate,     // "0.02" ETH per day  
    parseInt(rentalData.minHours), // 1 hour minimum
    parseInt(rentalData.maxHours)  // 168 hours (1 week) maximum
  );
};
```

**Smart Contract Listing:**
```typescript
const listNFT = async (tokenId: number, hourlyRate: string, dailyRate: string, minHours: number, maxHours: number) => {
  writeContract({
    address: CONTRACT_ADDRESSES.MARKETPLACE, // 0xDeCb...3c56
    abi: MARKETPLACE_ABI,
    functionName: 'listNFTForRent',
    args: [
      CONTRACT_ADDRESSES.RENTABLE_NFT, // NFT contract address
      BigInt(tokenId),                 // Token ID to list
      parseEther(hourlyRate),          // Convert "0.001" to wei
      parseEther(dailyRate),           // Convert "0.02" to wei  
      BigInt(minHours),               // Minimum rental duration
      BigInt(maxHours)                // Maximum rental duration
    ],
    chainId: sepolia.id,
  });
};
```

---

### **STEP 6: Smart Contract - Marketplace Listing**
📁 **File**: `contracts/NFTRentalMarketplace.sol`

**On-chain Listing Creation:**
```solidity
function listNFTForRent(
    address nftContract,
    uint256 tokenId,
    uint256 hourlyRate,
    uint256 dailyRate,
    uint256 minRentalHours,
    uint256 maxRentalHours
) external nonReentrant whenNotPaused {
    require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not the owner");
    require(!rentableNFT.isRented(tokenId), "NFT is currently rented");
    
    uint256 listingId = _listingIdCounter++; // Generate unique listing ID
    
    // Store listing data
    rentalListings[listingId] = RentalListing({
        nftContract: nftContract,
        tokenId: tokenId,
        owner: msg.sender,
        hourlyRate: hourlyRate,    // 1000000000000000 wei (0.001 ETH)
        dailyRate: dailyRate,      // 20000000000000000 wei (0.02 ETH)
        isActive: true,
        minRentalHours: minRentalHours,
        maxRentalHours: maxRentalHours
    });

    nftToListingId[nftContract][tokenId] = listingId;
    
    emit NFTListedForRent(listingId, nftContract, tokenId, msg.sender, hourlyRate, dailyRate);
}
```

**Result**: NFT is now listed in marketplace with:
- Listing ID: #1
- Hourly Rate: 0.001 ETH
- Daily Rate: 0.02 ETH
- Status: Available for rent

---

### **STEP 7: Marketplace Display**
📁 **File**: `src/app/marketplace/page.tsx`

**Fetching Live Listings:**
```tsx
export default function Marketplace() {
  const { listings, isLoading } = useMarketplaceListings();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map(listing => (
        <div key={listing.id} className="nft-card">
          <img src={listing.image} alt={listing.name} />
          <h3>{listing.name}</h3>
          <p>Rate: {listing.hourlyRate} ETH/hour</p>
          <p>Daily: {listing.dailyRate} ETH/day</p>
          <button onClick={() => handleRentNFT(listing.listingId)}>
            Rent Now
          </button>
        </div>
      ))}
    </div>
  );
}
```

**Backend Data Fetching:**
```typescript
export function useMarketplaceListings() {
  const { data: listingIds } = useReadContract({
    address: CONTRACT_ADDRESSES.MARKETPLACE,
    abi: MARKETPLACE_ABI,
    functionName: 'getActiveListings', // Returns [1, 2, 3...] listing IDs
    chainId: sepolia.id,
  });

  // For each listing ID, fetch full listing data and metadata
  useEffect(() => {
    const fetchListingsData = async () => {
      const listingPromises = listingIds.map(async (listingId) => {
        // Fetch listing details from smart contract
        const listingData = await readContract({
          address: CONTRACT_ADDRESSES.MARKETPLACE,
          abi: MARKETPLACE_ABI,
          functionName: 'rentalListings',
          args: [listingId]
        });
        
        // Fetch NFT metadata from IPFS
        const tokenURI = await readContract({
          address: listingData.nftContract,
          abi: RENTABLE_NFT_ABI,
          functionName: 'tokenURI',
          args: [listingData.tokenId]
        });
        
        // Get metadata from IPFS: "ipfs://QmMetadata..." -> actual JSON data
        const metadata = await ipfsService.fetchMetadata(tokenURI.replace('ipfs://', ''));
        
        return {
          listingId: Number(listingId),
          tokenId: Number(listingData.tokenId),
          name: metadata.name,
          image: metadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'),
          hourlyRate: formatEther(listingData.hourlyRate), // Convert wei to ETH
          dailyRate: formatEther(listingData.dailyRate),
          owner: listingData.owner,
          metadata: metadata
        };
      });
      
      const fetchedListings = await Promise.all(listingPromises);
      setListings(fetchedListings);
    };
  }, [listingIds]);
}
```

---

### **STEP 8: NFT Rental Process**
📁 **File**: `src/app/marketplace/page.tsx`

**User Rental Transaction:**
```tsx
const handleRentNFT = async (listingId: number, hourlyRate: string, dailyRate: string) => {
  // Calculate total cost based on rental duration
  let totalCost: number;
  if (rentalHours <= 24) {
    totalCost = parseFloat(hourlyRate) * rentalHours; // Use hourly rate
  } else {
    const days = Math.floor(rentalHours / 24);
    const remainingHours = rentalHours % 24;
    totalCost = (parseFloat(dailyRate) * days) + (parseFloat(hourlyRate) * remainingHours);
  }

  // Execute rental transaction
  await rentNFT(listingId, rentalHours, totalCost.toString());
};
```

**Smart Contract Rental Execution:**
```typescript
const rentNFT = async (listingId: number, rentalHours: number, totalCost: string) => {
  writeContract({
    address: CONTRACT_ADDRESSES.MARKETPLACE,
    abi: MARKETPLACE_ABI,
    functionName: 'rentNFT',
    args: [
      BigInt(listingId),    // Which listing to rent
      BigInt(rentalHours),  // How many hours to rent
      true                  // Use hourly rate (vs daily)
    ],
    value: parseEther(totalCost), // Send payment in ETH
    chainId: sepolia.id,
  });
};
```

---

### **STEP 9: Smart Contract - Rental Execution**
📁 **File**: `contracts/NFTRentalMarketplace.sol`

**On-chain Rental Process:**
```solidity
function rentNFT(uint256 listingId, uint256 rentalHours, bool useHourlyRate) 
    external payable nonReentrant whenNotPaused {
    
    RentalListing storage listing = rentalListings[listingId];
    require(listing.isActive, "Listing not active");
    require(!rentableNFT.isRented(listing.tokenId), "NFT is currently rented");
    
    // Calculate total cost
    uint256 totalCost;
    if (useHourlyRate) {
        totalCost = listing.hourlyRate * rentalHours; // 0.001 ETH * 24 hours = 0.024 ETH
    } else {
        uint256 numDays = rentalHours / 24;
        totalCost = listing.dailyRate * numDays;      // 0.02 ETH * 1 day = 0.02 ETH
    }
    
    require(msg.value >= totalCost, "Insufficient payment");

    uint256 rentalId = _rentalIdCounter++;
    uint256 startTime = block.timestamp;
    uint256 endTime = startTime + (rentalHours * 1 hours); // Current time + rental duration

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

    // Set renter as user of the NFT (ERC-4907 standard)
    rentableNFT.setUser(listing.tokenId, msg.sender, uint64(endTime));
    
    // Disable listing while rented
    listing.isActive = false;

    // Calculate and distribute payments
    uint256 platformFee = (totalCost * platformFeePercent) / 10000; // 2.5% platform fee
    uint256 ownerPayment = totalCost - platformFee;                 // 97.5% to owner

    // Transfer payment to NFT owner
    payable(listing.owner).transfer(ownerPayment);

    // Refund excess payment to renter
    if (msg.value > totalCost) {
        payable(msg.sender).transfer(msg.value - totalCost);
    }

    emit NFTRented(rentalId, listingId, msg.sender, startTime, endTime, totalCost);
}
```

---

### **STEP 10: NFT Usage Rights**
📁 **File**: `contracts/RentableNFT.sol`

**ERC-4907 Rental Standard:**
```solidity
function setUser(uint256 tokenId, address user, uint64 expires) external override {
    UserInfo storage info = _users[tokenId];
    info.user = user;      // Renter's address
    info.expires = expires; // When rental expires (timestamp)
    emit UpdateUser(tokenId, user, expires);
}

function userOf(uint256 tokenId) external view override returns (address) {
    // Return renter address if rental is still active
    if (uint64(block.timestamp) >= _users[tokenId].expires) {
        return address(0); // Rental expired
    }
    return _users[tokenId].user; // Return renter address
}
```

**Result**: 
- **Owner**: Still owns the NFT (can't transfer while rented)
- **Renter**: Has usage rights until rental expires
- **Usage Rights**: Display in games, use in DeFi, show in wallet, etc.
- **Payment**: Owner received payment minus platform fee

---

### **STEP 11: Dashboard Tracking**
📁 **File**: `src/app/dashboard/page.tsx`

**User Portfolio Display:**
```tsx
export default function Dashboard() {
  const { address } = useAccount();
  const { userNFTs, isLoading } = useUserNFTs();
  const { userRentals } = useUserRentals();
  
  return (
    <div className="dashboard">
      {/* My NFTs Section */}
      <section>
        <h2>My NFTs ({userNFTs.length})</h2>
        {userNFTs.map(nft => (
          <div key={nft.tokenId} className="nft-item">
            <img src={nft.image} alt={nft.name} />
            <div>
              <h3>{nft.name}</h3>
              <p>Earnings: {nft.totalEarnings} ETH</p>
              <p>Rentals: {nft.totalRentals}</p>
              <p>Status: {nft.currentlyRented ? 'Rented' : 'Available'}</p>
              {nft.currentlyRented && (
                <p>Rental ends: {new Date(nft.rentalEndTime).toLocaleString()}</p>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* My Rentals Section */}
      <section>
        <h2>My Rentals ({userRentals.length})</h2>
        {userRentals.map(rental => (
          <div key={rental.id} className="rental-item">
            <img src={rental.image} alt={rental.name} />
            <div>
              <h3>{rental.name}</h3>
              <p>Rental period: {new Date(rental.rentalStart).toLocaleDateString()} - {new Date(rental.rentalEnd).toLocaleDateString()}</p>
              <p>Total paid: {rental.totalPaid} ETH</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
```

---

## 🔍 Data Flow Summary

### **Forward Flow (Creation to Rental):**
```
1. User uploads image file
   ↓
2. Image uploaded to Pinata IPFS → Returns image hash
   ↓  
3. Metadata created with image hash → Uploaded to Pinata IPFS → Returns metadata hash
   ↓
4. Smart contract minting with metadata URI → Returns token ID
   ↓
5. NFT listed on marketplace with rental rates
   ↓
6. Marketplace displays NFT with real-time data from blockchain + IPFS
   ↓
7. User rents NFT → Payment sent → Usage rights transferred
   ↓
8. Dashboard shows earnings for owner, rental for renter
```

### **Key Technologies Used:**

**Frontend:**
- **Next.js 15**: React framework with app router
- **wagmi**: Ethereum wallet connections and contract interactions  
- **viem**: Low-level Ethereum utilities
- **React Hook Form**: Form handling
- **Framer Motion**: Animations
- **Tailwind CSS**: Styling

**Backend/Storage:**
- **Pinata IPFS**: Permanent decentralized storage
- **Sepolia Testnet**: Ethereum test network (Chain ID: 11155111)
- **Smart Contracts**: Solidity contracts for NFTs and marketplace

**Smart Contracts:**
- **RentableNFT.sol**: ERC-721 + ERC-4907 rentable NFT implementation
- **NFTRentalMarketplace.sol**: Marketplace for listing and renting NFTs

### **Key Contract Addresses (Sepolia):**
- **RentableNFT**: `0x4e3544cB317c9c42F9898D18681F4873da7c76fd`
- **Marketplace**: `0xDeCb458F3aA179510A547e47b45F59fD2d5C3c56`

---

## 🎯 Real-World Example

**User Journey:**
1. **Alice** uploads a digital art image (2MB PNG)
2. Image stored on IPFS: `QmImageABC123`
3. Metadata created and stored: `QmMetadataXYZ789`
4. NFT minted with Token ID #1234 
5. Alice lists NFT: 0.001 ETH/hour, 0.02 ETH/day
6. **Bob** sees listing in marketplace
7. Bob rents for 48 hours, pays 0.048 ETH
8. Alice receives 0.0468 ETH (97.5%), platform gets 0.0012 ETH (2.5%)
9. Bob can use NFT for 48 hours
10. After 48 hours, usage rights automatically return to Alice
11. Alice can rent to someone else or use herself

This system provides a complete, decentralized NFT rental marketplace with permanent storage, automated payments, and usage rights management! 🚀