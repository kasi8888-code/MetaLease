'use client';

import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function NetworkValidator() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isWrongNetwork = isConnected && chainId !== sepolia.id;

  if (!isWrongNetwork) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span className="font-medium">
              Wrong Network - Please switch to Sepolia testnet to use MetaLease
            </span>
          </div>
          <button
            onClick={() => switchChain({ chainId: sepolia.id })}
            className="flex items-center px-4 py-2 bg-red-700 hover:bg-red-800 rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Switch to Sepolia
          </button>
        </div>
      </div>
    </div>
  );
}