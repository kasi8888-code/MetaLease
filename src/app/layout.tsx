import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from '@/providers/Web3Provider';
import NetworkValidator from '@/components/NetworkValidator';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "MetaLease - NFT Rental Marketplace",
  description: "The first fully decentralized NFT rental marketplace. Rent and lend NFTs safely while retaining ownership. Built on Ethereum with smart contracts.",
  keywords: ["NFT", "rental", "marketplace", "blockchain", "web3", "ethereum", "defi"],
  authors: [{ name: "MetaLease Team" }],
  openGraph: {
    title: "MetaLease - NFT Rental Marketplace",
    description: "Transform your digital assets into income-generating utilities",
    type: "website",
    images: [{ url: "/og-image.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MetaLease - NFT Rental Marketplace",
    description: "The first fully decentralized NFT rental marketplace",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-surface">
        <Web3Provider>
          <NetworkValidator />
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'glass',
              style: {
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                color: '#1F2937',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              },
              success: {
                style: {
                  background: 'rgba(16, 185, 129, 0.95)',
                  color: 'white',
                },
              },
              error: {
                style: {
                  background: 'rgba(239, 68, 68, 0.95)',
                  color: 'white',
                },
              },
            }}
          />
        </Web3Provider>
      </body>
    </html>
  );
}
