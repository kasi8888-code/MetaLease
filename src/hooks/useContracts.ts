import { useWriteContract, useReadContract, useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ADDRESSES } from '@/config/constants';

// Rental NFT ABI (simplified for key functions)
const RENTAL_NFT_ABI = [
  {
    "inputs": [{"name": "to", "type": "address"}, {"name": "uri", "type": "string"}],
    "name": "mint",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "owner", "type": "address"}],
    "name": "tokensOfOwner",
    "outputs": [{"name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "userOf",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "userExpires",
    "outputs": [{"name": "", "type": "uint64"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Marketplace ABI (simplified for key functions)
const MARKETPLACE_ABI = [
  {
    "inputs": [
      {"name": "nftContract", "type": "address"},
      {"name": "tokenId", "type": "uint256"},
      {"name": "hourlyRate", "type": "uint256"},
      {"name": "dailyRate", "type": "uint256"},
      {"name": "minRentalHours", "type": "uint256"},
      {"name": "maxRentalHours", "type": "uint256"}
    ],
    "name": "listNFTForRent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "listingId", "type": "uint256"},
      {"name": "rentalHours", "type": "uint256"},
      {"name": "useHourlyRate", "type": "bool"}
    ],
    "name": "rentNFT",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveListings",
    "outputs": [{"name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "", "type": "uint256"}],
    "name": "rentalListings",
    "outputs": [
      {"name": "nftContract", "type": "address"},
      {"name": "tokenId", "type": "uint256"},
      {"name": "owner", "type": "address"},
      {"name": "hourlyRate", "type": "uint256"},
      {"name": "dailyRate", "type": "uint256"},
      {"name": "isActive", "type": "bool"},
      {"name": "minRentalHours", "type": "uint256"},
      {"name": "maxRentalHours", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Hook for minting NFTs
export const useMintNFT = () => {
  const { address } = useAccount();
  
  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  const mint = async (tokenURI: string) => {
    if (!address) throw new Error('Wallet not connected');
    
    writeContract({
      address: CONTRACT_ADDRESSES.RENTABLE_NFT as `0x${string}`,
      abi: RENTAL_NFT_ABI,
      functionName: 'mint',
      args: [address, tokenURI],
    });
  };

  return {
    mint,
    isLoading: isPending,
    isSuccess,
    error
  };
};

// Hook for listing NFTs for rent
export const useListNFT = () => {
  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  const listForRent = async (
    tokenId: number,
    hourlyRateETH: string,
    dailyRateETH: string,
    minHours: number,
    maxHours: number
  ) => {
    const hourlyRate = parseEther(hourlyRateETH);
    const dailyRate = parseEther(dailyRateETH);

    writeContract({
      address: CONTRACT_ADDRESSES.MARKETPLACE as `0x${string}`,
      abi: MARKETPLACE_ABI,
      functionName: 'listNFTForRent',
      args: [
        CONTRACT_ADDRESSES.RENTABLE_NFT as `0x${string}`,
        BigInt(tokenId),
        hourlyRate,
        dailyRate,
        BigInt(minHours),
        BigInt(maxHours)
      ],
    });
  };

  return {
    listForRent,
    isLoading: isPending,
    isSuccess,
    error
  };
};

// Hook for renting NFTs
export const useRentNFT = () => {
  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  const rent = async (
    listingId: number,
    rentalHours: number,
    useHourlyRate: boolean,
    paymentAmount: string
  ) => {
    writeContract({
      address: CONTRACT_ADDRESSES.MARKETPLACE as `0x${string}`,
      abi: MARKETPLACE_ABI,
      functionName: 'rentNFT',
      args: [BigInt(listingId), BigInt(rentalHours), useHourlyRate],
      value: parseEther(paymentAmount),
    });
  };

  return {
    rent,
    isLoading: isPending,
    isSuccess,
    error
  };
};

// Hook for getting user's NFTs
export const useUserNFTs = () => {
  const { address } = useAccount();

  const { data: tokenIds, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.RENTABLE_NFT as `0x${string}`,
    abi: RENTAL_NFT_ABI,
    functionName: 'tokensOfOwner',
    args: address ? [address] : undefined,
  });

  return {
    tokenIds: tokenIds as bigint[] | undefined,
    isLoading
  };
};

// Hook for getting active marketplace listings
export const useMarketplaceListings = () => {
  const { data: listingIds, isLoading: loadingIds } = useReadContract({
    address: CONTRACT_ADDRESSES.MARKETPLACE as `0x${string}`,
    abi: MARKETPLACE_ABI,
    functionName: 'getActiveListings',
  });

  return {
    listingIds: listingIds as bigint[] | undefined,
    isLoading: loadingIds
  };
};

// Hook for getting specific listing details
export const useListingDetails = (listingId: bigint | undefined) => {
  const { data: listing, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.MARKETPLACE as `0x${string}`,
    abi: MARKETPLACE_ABI,
    functionName: 'rentalListings',
    args: listingId ? [listingId] : undefined,
  });

  return {
    listing,
    isLoading
  };
};