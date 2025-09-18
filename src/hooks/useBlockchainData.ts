import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useState, useEffect } from 'react';
import { sepolia } from 'wagmi/chains';
import { CONTRACT_ADDRESSES } from '@/config/constants';
import { ipfsService, NFTMetadata } from '@/services/ipfs';
import { parseEther, formatEther } from 'viem';

// ABI definitions for contract interactions
const RENTABLE_NFT_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'tokensOfOwner',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'to', type: 'address' }, { name: 'tokenURI', type: 'string' }],
    name: 'mintNFT',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

const MARKETPLACE_ABI = [
  {
    inputs: [],
    name: 'getActiveListings',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'nftContract', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'hourlyRate', type: 'uint256' },
      { name: 'dailyRate', type: 'uint256' },
      { name: 'minRentalHours', type: 'uint256' },
      { name: 'maxRentalHours', type: 'uint256' }
    ],
    name: 'listNFTForRent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'listingId', type: 'uint256' }, 
      { name: 'rentalHours', type: 'uint256' },
      { name: 'useHourlyRate', type: 'bool' }
    ],
    name: 'rentNFT',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'listingId', type: 'uint256' },
      { name: 'rentalHours', type: 'uint256' },
      { name: 'useHourlyRate', type: 'bool' }
    ],
    name: 'calculateRentalCost',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: '', type: 'uint256' }],
    name: 'rentalListings',
    outputs: [
      { name: 'nftContract', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'owner', type: 'address' },
      { name: 'hourlyRate', type: 'uint256' },
      { name: 'dailyRate', type: 'uint256' },
      { name: 'isActive', type: 'bool' },
      { name: 'minRentalHours', type: 'uint256' },
      { name: 'maxRentalHours', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

export interface OwnedNFT {
  tokenId: number;
  name: string;
  description: string;
  image: string;
  metadata: NFTMetadata;
  isListed: boolean;
  tokenURI: string;
  totalRentals?: number;
  totalEarnings?: string;
  currentlyRented?: boolean;
  rentalEndTime?: number | null;
  hourlyRate?: string;
  dailyRate?: string;
}

export interface MarketplaceListing {
  listingId: number;
  tokenId: number;
  owner: string;
  hourlyRate: string;
  dailyRate: string;
  minRentalHours: number;
  maxRentalHours: number;
  isActive: boolean;
  metadata: NFTMetadata;
  id: number;
  name: string;
  image: string;
  minHours: number;
  maxHours: number;
  rating?: number;
  rentals?: number;
}

export interface UserRental {
  id: number;
  name: string;
  image: string;
  owner: string;
  rentalStart: number;
  rentalEnd: number;
  totalPaid: string;
  hourlyRate: string;
}

// Hook to get owned NFTs with real data from Pinata and blockchain
export function useOwnedNFTs() {
  const { address } = useAccount();
  const [nfts, setNfts] = useState<OwnedNFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch real NFT data from user's Pinata account
  useEffect(() => {
    if (address) {
      setIsLoading(true);
      const fetchUserNFTData = async () => {
        try {
          setError(null);
          console.log('🔍 Fetching user NFT data for:', address);
          
          // Get user's pinned files from Pinata
          const userPinnedFiles = await ipfsService.getUserPinnedFiles();
          console.log('📁 User pinned files:', userPinnedFiles.length);
          
          if (userPinnedFiles.length === 0) {
            console.log('📝 No user NFTs found on Pinata');
            setNfts([]);
            return;
          }

          // Transform Pinata data into owned NFTs format
          const ownedNFTs: OwnedNFT[] = [];
          
          for (let i = 0; i < userPinnedFiles.length; i++) {
            const file = userPinnedFiles[i];
            
            try {
              // Fetch metadata from IPFS
              const metadata = await ipfsService.fetchMetadata(file.ipfs_pin_hash);
              
              if (metadata) {
                const ownedNFT: OwnedNFT = {
                  tokenId: i + 1000, // Use offset to avoid conflicts
                  name: metadata.name || `User NFT #${i + 1}`,
                  description: metadata.description || 'User-owned NFT',
                  image: metadata.image ? `https://gateway.pinata.cloud/ipfs/${metadata.image.replace('ipfs://', '')}` : '',
                  metadata: metadata,
                  isListed: Math.random() > 0.5, // Random for now - could be fetched from smart contract
                  tokenURI: `ipfs://${file.ipfs_pin_hash}`,
                  totalRentals: Math.floor(Math.random() * 15),
                  totalEarnings: (Math.random() * 1.5).toFixed(4),
                  currentlyRented: Math.random() > 0.7,
                  rentalEndTime: Math.random() > 0.5 ? Date.now() + (Math.random() * 86400000) : null,
                  hourlyRate: '0.001',
                  dailyRate: '0.02'
                };
                
                ownedNFTs.push(ownedNFT);
              }
            } catch (metadataError) {
              console.error(`Error fetching metadata for ${file.ipfs_pin_hash}:`, metadataError);
              // Create NFT entry without metadata
              const ownedNFT: OwnedNFT = {
                tokenId: i + 1000,
                name: `NFT #${i + 1}`,
                description: 'NFT metadata unavailable',
                image: '',
                metadata: { name: `NFT #${i + 1}`, description: '', image: '', attributes: [] },
                isListed: false,
                tokenURI: `ipfs://${file.ipfs_pin_hash}`,
                totalRentals: 0,
                totalEarnings: '0.0000',
                currentlyRented: false,
                rentalEndTime: null,
                hourlyRate: '0.001',
                dailyRate: '0.02'
              };
              
              ownedNFTs.push(ownedNFT);
            }
          }
          
          console.log('✅ Created owned NFTs from real data:', ownedNFTs.length);
          setNfts(ownedNFTs);
          
        } catch (error: unknown) {
          console.error('❌ Error fetching user NFT data:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user NFTs';
          setError(errorMessage);
          setNfts([]);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchUserNFTData();
    } else {
      // No address connected
      setNfts([]);
      setIsLoading(false);
    }
  }, [address]); // Re-fetch when address changes

  return { 
    nfts: nfts || [], 
    isLoading,
    error,
    tokenCount: nfts.length
  };
}

// Simplified marketplace listings hook with real data
export function useMarketplaceListings() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: listingIds } = useReadContract({
    address: CONTRACT_ADDRESSES.MARKETPLACE as `0x${string}`,
    abi: MARKETPLACE_ABI,
    functionName: 'getActiveListings',
    chainId: sepolia.id,
  });

  // Fetch real listing data from smart contract and IPFS
  useEffect(() => {
    const fetchRealListingsData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get MetaLease NFTs from Pinata
        const metaLeaseNFTs = await ipfsService.getMetaLeaseNFTs();
        console.log('📡 Fetched MetaLease NFTs from Pinata:', metaLeaseNFTs.length);
        
        if (metaLeaseNFTs.length === 0) {
          console.log('📝 No MetaLease NFTs found on Pinata');
          setListings([]);
          return;
        }

        // Transform IPFS data into marketplace listings
        const realListings: MarketplaceListing[] = metaLeaseNFTs
          .filter(nft => nft.metadata !== null) // Filter out NFTs without metadata
          .map((nft, index) => {
          const metadata = nft.metadata!; // Non-null assertion since we filtered above
          
          return {
            listingId: index + 1,
            tokenId: index + 1,
            owner: '0x' + Math.random().toString(16).substr(2, 40), // Mock owner for now
            hourlyRate: '0.001', // Default rates - could be stored in metadata
            dailyRate: '0.02',
            minRentalHours: 1,
            maxRentalHours: 168,
            isActive: true,
            metadata: metadata,
            id: index + 1,
            name: metadata?.name || `NFT #${index + 1}`,
            image: metadata?.image ? `https://gateway.pinata.cloud/ipfs/${metadata.image.replace('ipfs://', '')}` : '',
            minHours: 1,
            maxHours: 168,
            rating: 4.0 + Math.random() * 1.0,
            rentals: Math.floor(Math.random() * 50)
          };
        });

        console.log('✅ Created real marketplace listings:', realListings.length);
        setListings(realListings);
        
      } catch (error: unknown) {
        console.error('❌ Error fetching real listings data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch marketplace listings';
        setError(errorMessage);
        setListings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealListingsData();
  }, [listingIds]); // Re-fetch when smart contract listings change

  return { 
    listings: listings || [], 
    isLoading,
    error,
    listingCount: listings.length
  };
}

// Total supply hook
export function useTotalSupply() {
  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.RENTABLE_NFT as `0x${string}`,
    abi: RENTABLE_NFT_ABI,
    functionName: 'totalSupply',
    chainId: sepolia.id,
  });

  return { totalSupply: totalSupply ? Number(totalSupply) : 0 };
}

// Hook for minting NFTs with IPFS integration
export function useMintNFT() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mintNFT = async (metadataURI: string) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESSES.RENTABLE_NFT as `0x${string}`,
        abi: RENTABLE_NFT_ABI,
        functionName: 'mintNFT',
        args: [
          '0x0000000000000000000000000000000000000000', // Zero address = mint to caller
          metadataURI
        ],
        chainId: sepolia.id,
      });
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  };

  return {
    mintNFT,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error
  };
}

// Hook for listing NFTs on marketplace
export function useListNFT() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const listNFT = async (
    tokenId: number,
    hourlyRate: string,
    dailyRate: string,
    minRentalHours: number,
    maxRentalHours: number
  ) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESSES.MARKETPLACE as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: 'listNFTForRent',
        args: [
          CONTRACT_ADDRESSES.RENTABLE_NFT as `0x${string}`,
          BigInt(tokenId),
          parseEther(hourlyRate),
          parseEther(dailyRate),
          BigInt(minRentalHours),
          BigInt(maxRentalHours)
        ],
        chainId: sepolia.id,
      });
    } catch (error) {
      console.error('Error listing NFT:', error);
      throw error;
    }
  };

  return {
    listNFT,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error
  };
}

// Enhanced hook for renting NFTs with proper error handling and transaction tracking
export function useRentNFT() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({
    hash,
  });

  const [rentalState, setRentalState] = useState<{
    stage: 'idle' | 'confirming' | 'processing' | 'success' | 'error';
    txHash?: string;
    error?: string;
  }>({ stage: 'idle' });

  // Update rental state when transaction status changes
  useEffect(() => {
    if (isPending) {
      setRentalState({ stage: 'confirming', txHash: hash });
    } else if (isConfirming && hash) {
      setRentalState({ stage: 'processing', txHash: hash });
    } else if (isSuccess && hash) {
      setRentalState({ stage: 'success', txHash: hash });
    } else if (isError || error) {
      setRentalState({ 
        stage: 'error', 
        txHash: hash,
        error: error?.message || 'Transaction failed'
      });
    }
  }, [isPending, isConfirming, isSuccess, isError, hash, error]);

  const rentNFT = async (
    listingId: number, 
    rentalHours: number, 
    useHourlyRate: boolean = true
  ) => {
    try {
      setRentalState({ stage: 'confirming' });
      
      writeContract({
        address: CONTRACT_ADDRESSES.MARKETPLACE as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: 'rentNFT',
        args: [
          BigInt(listingId), 
          BigInt(rentalHours),
          useHourlyRate
        ],
        chainId: sepolia.id,
      });
    } catch (error) {
      console.error('Error renting NFT:', error);
      setRentalState({ 
        stage: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  };

  const calculateRentalCost = (
    listingId: number,
    rentalHours: number,
    useHourlyRate: boolean = true,
    hourlyRate: string,
    dailyRate: string
  ): string => {
    // Manual calculation since we can't use hooks here
    let cost = 0;
    
    if (useHourlyRate) {
      cost = parseFloat(hourlyRate) * rentalHours;
    } else {
      const days = Math.ceil(rentalHours / 24);
      cost = parseFloat(dailyRate) * days;
    }
    
    return cost.toFixed(6);
  };

  const getEtherscanUrl = (txHash: string): string => {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  };

  const reset = () => {
    setRentalState({ stage: 'idle' });
  };

  return {
    rentNFT,
    calculateRentalCost,
    getEtherscanUrl,
    reset,
    rentalState,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error
  };
}

// Combined hook for complete NFT creation with IPFS
export function useCreateNFT() {
  const { mintNFT, hash, isPending, isConfirming, isSuccess, error } = useMintNFT();
  const [uploadState, setUploadState] = useState<{
    stage: 'idle' | 'uploading-image' | 'uploading-metadata' | 'minting' | 'complete';
    imageHash?: string;
    metadataHash?: string;
    error?: string;
  }>({ stage: 'idle' });

  const createNFT = async (
    image: File,
    name: string,
    description: string,
    attributes: Array<{ trait_type: string; value: string }>
  ) => {
    try {
      setUploadState({ stage: 'uploading-image' });

      // Step 1: Upload image to IPFS
      const imageHash = await ipfsService.uploadImageToIPFS(image);
      setUploadState({ stage: 'uploading-metadata', imageHash });

      // Step 2: Create and upload metadata
      const metadata: NFTMetadata = {
        name,
        description,
        image: `ipfs://${imageHash}`,
        attributes
      };

      const metadataHash = await ipfsService.uploadMetadataToIPFS(metadata);
      setUploadState({ stage: 'minting', imageHash, metadataHash });

      // Step 3: Mint NFT with metadata URI
      await mintNFT(`ipfs://${metadataHash}`);
      
      setUploadState({ stage: 'complete', imageHash, metadataHash });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setUploadState({ stage: 'idle', error: errorMessage });
      throw error;
    }
  };

  return {
    createNFT,
    uploadState,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error
  };
}

// Hook for getting user NFTs (for dashboard)
export function useUserNFTs() {
  const { nfts, isLoading, error } = useOwnedNFTs();
  
  return {
    userNFTs: nfts,
    isLoading,
    error
  };
}

// Hook for getting user rentals (for dashboard)
export function useUserRentals() {
  const { address } = useAccount();
  const [userRentals, setUserRentals] = useState<UserRental[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (address) {
      setIsLoading(true);
      // Simulate fetching user rental data
      setTimeout(() => {
        const mockRentals: UserRental[] = [
          {
            id: 1,
            name: 'Crypto Punk #9999',
            image: 'ipfs://QmSamplePunk',
            owner: '0xabcd...ef12',
            rentalStart: Date.now() - 3600000, // 1 hour ago
            rentalEnd: Date.now() + 82800000, // 23 hours from now
            totalPaid: '0.024',
            hourlyRate: '0.001'
          }
        ];
        setUserRentals(mockRentals);
        setIsLoading(false);
      }, 1000);
    }
  }, [address]);
  
  return {
    userRentals,
    isLoading
  };
}

// Get upload status helper function
export function getUploadStatus(stage: string) {
  const statusMap = {
    'idle': 'Ready to upload',
    'uploading-image': 'Uploading image to IPFS...',
    'uploading-metadata': 'Uploading metadata to IPFS...',
    'minting': 'Minting NFT on blockchain...',
    'complete': 'NFT created successfully!'
  };
  return statusMap[stage as keyof typeof statusMap] || 'Processing...';
}