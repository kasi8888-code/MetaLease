import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from '@/providers/Web3Provider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MetaLease - NFT Rental Marketplace",
  description: "Decentralized NFT rental marketplace - Rent and lend NFTs safely",
  keywords: ["NFT", "rental", "marketplace", "blockchain", "web3"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased font-sans bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen`}>
        <Web3Provider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                borderRadius: '0.5rem',
              },
            }}
          />
        </Web3Provider>
      </body>
    </html>
  );
}
