import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';
const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS;

const MARKETPLACE_ABI = [
  {
    "inputs": [{"name": "", "type": "uint256"}],
    "name": "rentalListings",
    "outputs": [
      {"name": "nftContract", "type": "address"},
      {"name": "tokenId", "type": "uint256"},
      {"name": "owner", "type": "address"},
      {"name": "hourlyRate", "type": "uint256"},
      {"name": "dailyRate", "type": "uint256"},
      {"name": "isActive", "type": "boolean"},
      {"name": "minRentalHours", "type": "uint256"},
      {"name": "maxRentalHours", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ listingId: string }> }
) {
  try {
    const params = await context.params;
    const listingId = params.listingId;
    
    if (!MARKETPLACE_ADDRESS) {
      return NextResponse.json({ error: 'Marketplace address not configured' }, { status: 500 });
    }

    // Connect to Sepolia
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
    const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);

    // Get listing data
    const listing = await contract.rentalListings(listingId);

    return NextResponse.json({
      listingId,
      nftContract: listing[0],
      tokenId: listing[1].toString(),
      owner: listing[2],
      hourlyRate: ethers.formatEther(listing[3]),
      dailyRate: ethers.formatEther(listing[4]),
      isActive: listing[5],
      minRentalHours: listing[6].toString(),
      maxRentalHours: listing[7].toString(),
    });

  } catch (error) {
    console.error('Error fetching listing data:', error);
    return NextResponse.json({ error: 'Failed to fetch listing data' }, { status: 500 });
  }
}