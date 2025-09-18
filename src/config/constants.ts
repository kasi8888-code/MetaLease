export const CONTRACT_ADDRESSES = {
  RENTABLE_NFT: process.env.NEXT_PUBLIC_RENTABLE_NFT_ADDRESS || '0x4e3544cB317c9c42F9898D18681F4873da7c76fd',
  MARKETPLACE: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || '0xDeCb458F3aA179510A547e47b45F59fD2d5C3c56',
} as const;

export const SEPOLIA_CHAIN_ID = 11155111;

// Force Sepolia testnet usage
export const CHAIN_CONFIG = {
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
      http: [
        process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'
      ],
    },
    public: {
      http: ['https://rpc.sepolia.org'],
    },
  },
  blockExplorers: {
    default: { name: 'Sepolia Etherscan', url: 'https://sepolia.etherscan.io' },
  },
  testnet: true,
} as const;

export const SUPPORTED_CHAINS = {
  SEPOLIA: CHAIN_CONFIG,
};

export const IPFS_CONFIG = {
  GATEWAY: process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/',
  PINATA_API_KEY: process.env.PINATA_API_KEY || '',
  PINATA_SECRET_KEY: process.env.PINATA_SECRET_KEY || '',
};