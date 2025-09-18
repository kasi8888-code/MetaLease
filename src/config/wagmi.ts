import { http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// Use a working demo project ID
const projectId = '2f5a2d1e4b6c3a9f8e7d6c5b4a3f2e1d';

export const config = getDefaultConfig({
  appName: 'MetaLease NFT Rental',
  projectId,
  chains: [sepolia], // Only Sepolia testnet
  ssr: true, // If your dApp uses server side rendering (SSR)
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}