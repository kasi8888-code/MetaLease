import { http, createConfig } from 'wagmi';
import { sepolia, mainnet } from 'wagmi/chains';
import { metaMask, injected, walletConnect } from 'wagmi/connectors';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'default-project-id';

export const config = createConfig({
  chains: [sepolia, mainnet],
  connectors: [
    metaMask(),
    injected(),
    walletConnect({ 
      projectId,
      showQrModal: true,
    }),
  ],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}