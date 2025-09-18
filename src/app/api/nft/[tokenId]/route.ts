import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';
const RENTABLE_NFT_ADDRESS = process.env.NEXT_PUBLIC_RENTABLE_NFT_ADDRESS;

const RENTABLE_NFT_ABI = [
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ tokenId: string }> }
) {
  try {
    const params = await context.params;
    const tokenId = params.tokenId;
    
    if (!RENTABLE_NFT_ADDRESS) {
      return NextResponse.json({ error: 'Contract address not configured' }, { status: 500 });
    }

    // Connect to Sepolia
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
    const contract = new ethers.Contract(RENTABLE_NFT_ADDRESS, RENTABLE_NFT_ABI, provider);

    // Get token URI
    const tokenURI = await contract.tokenURI(tokenId);

    return NextResponse.json({
      tokenId,
      tokenURI,
    });

  } catch (error) {
    console.error('Error fetching NFT data:', error);
    return NextResponse.json({ error: 'Failed to fetch NFT data' }, { status: 500 });
  }
}