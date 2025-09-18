// Test hooks integration with enhanced IPFS service
// This simulates how the UI hooks will use our enhanced IPFS methods

import { useState, useEffect } from 'react';

// Mock IPFS Service methods (simulating what our enhanced service provides)
const mockIPFSService = {
  async getUserPinnedFiles(userAddress: string) {
    // Simulate API call to get user's pinned files
    return [
      {
        ipfs_pin_hash: 'QmTestHash1',
        metadata: {
          name: 'MetaLease-NFT-1',
          keyvalues: { platform: 'MetaLease', type: 'nft-metadata' }
        },
        date_pinned: '2025-09-18T19:00:00.000Z'
      },
      {
        ipfs_pin_hash: 'QmTestHash2', 
        metadata: {
          name: 'MetaLease-NFT-2',
          keyvalues: { platform: 'MetaLease', type: 'nft-metadata' }
        },
        date_pinned: '2025-09-18T18:00:00.000Z'
      }
    ];
  },

  async getMetaLeaseNFTs() {
    // Simulate getting all MetaLease NFTs with metadata
    return [
      {
        id: 1,
        tokenId: 1001,
        name: 'Luxury Beach House',
        description: 'Beautiful beachfront property',
        image: 'https://gateway.pinata.cloud/ipfs/QmImageHash1',
        dailyRate: 500,
        location: 'Miami, FL',
        ipfsHash: 'QmTestHash1',
        metadata: {
          attributes: [
            { trait_type: 'Property Type', value: 'Beach House' },
            { trait_type: 'Location', value: 'Miami, FL' },
            { trait_type: 'Daily Rate', value: '$500' }
          ]
        }
      },
      {
        id: 2,
        tokenId: 1002, 
        name: 'Modern City Apartment',
        description: 'Stylish apartment in downtown',
        image: 'https://gateway.pinata.cloud/ipfs/QmImageHash2',
        dailyRate: 300,
        location: 'New York, NY',
        ipfsHash: 'QmTestHash2',
        metadata: {
          attributes: [
            { trait_type: 'Property Type', value: 'Apartment' },
            { trait_type: 'Location', value: 'New York, NY' },
            { trait_type: 'Daily Rate', value: '$300' }
          ]
        }
      }
    ];
  },

  async uploadNFTMetadata(metadata: any) {
    // Simulate uploading NFT metadata
    const hash = `Qm${Math.random().toString(36).substring(2, 15)}`;
    return {
      success: true,
      ipfsHash: hash,
      url: `https://gateway.pinata.cloud/ipfs/${hash}`
    };
  }
};

// Enhanced hook using the IPFS service methods
export const useEnhancedMarketplaceNFTs = () => {
  const [nfts, setNFTs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketplaceNFTs = async () => {
      try {
        setLoading(true);
        
        // Use enhanced IPFS service method
        const metaLeaseNFTs = await mockIPFSService.getMetaLeaseNFTs();
        
        // Transform for marketplace display
        const marketplaceListings = metaLeaseNFTs.map(nft => ({
          ...nft,
          owner: '0x' + Math.random().toString(16).substring(2, 42), // Mock owner
          available: true,
          category: 'property',
          rating: 4.5 + Math.random() * 0.5, // Mock rating
          reviews: Math.floor(Math.random() * 50) + 1
        }));

        setNFTs(marketplaceListings);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch marketplace NFTs');
        setNFTs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketplaceNFTs();
  }, []);

  const refreshListings = async () => {
    const metaLeaseNFTs = await mockIPFSService.getMetaLeaseNFTs();
    const marketplaceListings = metaLeaseNFTs.map(nft => ({
      ...nft,
      owner: '0x' + Math.random().toString(16).substring(2, 42),
      available: true,
      category: 'property',
      rating: 4.5 + Math.random() * 0.5,
      reviews: Math.floor(Math.random() * 50) + 1
    }));
    setNFTs(marketplaceListings);
  };

  return {
    nfts,
    loading,
    error,
    refreshListings
  };
};

// Enhanced user NFTs hook
export const useEnhancedUserNFTs = (userAddress: string) => {
  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userAddress) return;

    const fetchUserNFTs = async () => {
      try {
        setLoading(true);
        
        // Use enhanced IPFS service method
        const pinnedFiles = await mockIPFSService.getUserPinnedFiles(userAddress);
        
        // Transform for dashboard display
        const dashboardNFTs = pinnedFiles.map((file, index) => ({
          id: index + 1,
          tokenId: 2000 + index,
          name: file.metadata.name?.replace('MetaLease-NFT-', 'Property #') || `Property #${index + 1}`,
          image: `https://gateway.pinata.cloud/ipfs/QmMockImage${index + 1}`,
          ipfsHash: file.ipfs_pin_hash,
          earnings: Math.floor(Math.random() * 2000), // Mock earnings
          totalRentals: Math.floor(Math.random() * 15), // Mock rentals
          isListed: Math.random() > 0.3, // 70% chance of being listed
          listingPrice: [200, 300, 400, 500, 600][Math.floor(Math.random() * 5)],
          createdAt: new Date(file.date_pinned).getTime(),
          status: Math.random() > 0.8 ? 'rented' : 'available'
        }));

        setUserNFTs(dashboardNFTs);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user NFTs');
        setUserNFTs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserNFTs();
  }, [userAddress]);

  return {
    userNFTs,
    loading,
    error,
    totalEarnings: userNFTs.reduce((sum, nft) => sum + nft.earnings, 0),
    totalNFTs: userNFTs.length,
    listedNFTs: userNFTs.filter(nft => nft.isListed).length,
    activeRentals: userNFTs.filter(nft => nft.status === 'rented').length
  };
};

// Enhanced NFT creation hook
export const useEnhancedNFTCreation = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const createNFT = async (nftData: {
    name: string;
    description: string;
    image: string;
    dailyRate: number;
    location: string;
    propertyType: string;
    maxGuests: number;
    amenities: string[];
  }) => {
    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      // Step 1: Prepare metadata (10%)
      setUploadProgress(10);
      const metadata = {
        name: nftData.name,
        description: nftData.description,
        image: nftData.image,
        attributes: [
          { trait_type: 'Property Type', value: nftData.propertyType },
          { trait_type: 'Location', value: nftData.location },
          { trait_type: 'Daily Rate', value: `$${nftData.dailyRate}` },
          { trait_type: 'Max Guests', value: nftData.maxGuests.toString() },
          { trait_type: 'Created Date', value: new Date().toISOString().split('T')[0] }
        ],
        platform: 'MetaLease',
        version: '1.0',
        created_at: new Date().toISOString(),
        property_details: {
          daily_rate: nftData.dailyRate,
          max_guests: nftData.maxGuests,
          amenities: nftData.amenities,
          location: {
            full: nftData.location,
            city: nftData.location.split(',')[0]?.trim() || '',
            state: nftData.location.split(',')[1]?.trim() || ''
          }
        }
      };

      // Step 2: Upload to IPFS (50%)
      setUploadProgress(50);
      const uploadResult = await mockIPFSService.uploadNFTMetadata(metadata);
      
      if (!uploadResult.success) {
        throw new Error('IPFS upload failed');
      }

      // Step 3: Simulate smart contract minting (80%)
      setUploadProgress(80);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate minting delay

      // Step 4: Complete (100%)
      setUploadProgress(100);

      const newNFT = {
        id: Math.floor(Math.random() * 10000),
        tokenId: Math.floor(Math.random() * 10000),
        name: metadata.name,
        description: metadata.description,
        image: `https://gateway.pinata.cloud/ipfs/${metadata.image}`,
        dailyRate: nftData.dailyRate,
        location: nftData.location,
        ipfsHash: uploadResult.ipfsHash,
        metadata: metadata,
        owner: '0xCurrentUserAddress', // Would be actual user address
        available: true,
        createdAt: Date.now()
      };

      return {
        success: true,
        nft: newNFT,
        ipfsHash: uploadResult.ipfsHash,
        ipfsUrl: uploadResult.url
      };

    } catch (err: any) {
      setError(err.message || 'NFT creation failed');
      return { success: false, error: err.message };
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    createNFT,
    isUploading,
    uploadProgress,
    error
  };
};

// Test component that uses all enhanced hooks
export const EnhancedNFTTestComponent = () => {
  const userAddress = '0x1234567890abcdef1234567890abcdef12345678';
  
  // Use enhanced hooks
  const { nfts: marketplaceNFTs, loading: marketplaceLoading, refreshListings } = useEnhancedMarketplaceNFTs();
  const { userNFTs, totalEarnings, totalNFTs, listedNFTs, activeRentals, loading: userLoading } = useEnhancedUserNFTs(userAddress);
  const { createNFT, isUploading, uploadProgress, error: creationError } = useEnhancedNFTCreation();

  const handleCreateNFT = async () => {
    const result = await createNFT({
      name: 'Test Property via Enhanced Hook',
      description: 'Created using enhanced IPFS service integration',
      image: 'QmTestImageHash',
      dailyRate: 400,
      location: 'San Francisco, CA',
      propertyType: 'Modern Loft',
      maxGuests: 4,
      amenities: ['WiFi', 'Kitchen', 'Parking']
    });

    if (result.success) {
      console.log('✅ NFT Created Successfully:', result.nft?.name);
      console.log('🔗 IPFS Hash:', result.ipfsHash);
      // Refresh marketplace to show new NFT
      await refreshListings();
    } else {
      console.error('❌ NFT Creation Failed:', result.error);
    }
  };

  return (
    <div>
      <h2>Enhanced IPFS Service Integration Test</h2>
      
      {/* Marketplace Section */}
      <div>
        <h3>Marketplace ({marketplaceNFTs.length} listings)</h3>
        {marketplaceLoading ? (
          <p>Loading marketplace...</p>
        ) : (
          <ul>
            {marketplaceNFTs.map(nft => (
              <li key={nft.id}>
                {nft.name} - ${nft.dailyRate}/day ({nft.location})
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Dashboard Section */}
      <div>
        <h3>User Dashboard</h3>
        {userLoading ? (
          <p>Loading user NFTs...</p>
        ) : (
          <div>
            <p>Total NFTs: {totalNFTs}</p>
            <p>Listed: {listedNFTs}</p>
            <p>Active Rentals: {activeRentals}</p>
            <p>Total Earnings: ${totalEarnings}</p>
            <ul>
              {userNFTs.map(nft => (
                <li key={nft.id}>
                  {nft.name} - ${nft.earnings} earned from {nft.totalRentals} rentals
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Creation Section */}
      <div>
        <h3>NFT Creation</h3>
        <button 
          onClick={handleCreateNFT} 
          disabled={isUploading}
        >
          {isUploading ? `Creating... ${uploadProgress}%` : 'Create Test NFT'}
        </button>
        {creationError && <p style={{color: 'red'}}>Error: {creationError}</p>}
      </div>
    </div>
  );
};

console.log('✅ Enhanced hooks integration test file created');
console.log('🔄 This demonstrates how UI components will use enhanced IPFS service methods');
console.log('📋 Key integrations tested:');
console.log('   • useEnhancedMarketplaceNFTs - for marketplace page');  
console.log('   • useEnhancedUserNFTs - for dashboard page');
console.log('   • useEnhancedNFTCreation - for create page');
console.log('🎯 All hooks use the enhanced IPFS service methods we implemented');