'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function TestWallet() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Wallet Connection Test</h1>
        <ConnectButton />
        <p className="mt-4 text-gray-600">
          This is a simple test page for wallet connection
        </p>
      </div>
    </div>
  );
}