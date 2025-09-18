export const CONTRACT_ADDRESSES = {
  RENTABLE_NFT: process.env.NEXT_PUBLIC_RENTABLE_NFT_ADDRESS || '0x0000000000000000000000000000000000000000',
  MARKETPLACE: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || '0x0000000000000000000000000000000000000000',
} as const;

export const SEPOLIA_CHAIN_ID = 11155111;

export const SUPPORTED_CHAINS = {
  SEPOLIA: {
    id: SEPOLIA_CHAIN_ID,
    name: 'Sepolia',
    network: 'sepolia',
    nativeCurrency: {
      decimals: 18,
      name: 'Sepolia Ether',
      symbol: 'SEP',
    },
    rpcUrls: {
      default: {
        http: ['https://rpc.sepolia.org'],
      },
      public: {
        http: ['https://rpc.sepolia.org'],
      },
    },
    blockExplorers: {
      default: { name: 'Sepolia Etherscan', url: 'https://sepolia.etherscan.io' },
    },
  },
};

export const IPFS_CONFIG = {
  GATEWAY: process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/',
  PINATA_API_KEY: process.env.PINATA_API_KEY || '',
  PINATA_SECRET_KEY: process.env.PINATA_SECRET_KEY || '',
};