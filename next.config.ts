import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure external image domains for Vercel deployment
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        port: '',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        port: '',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: '**.ipfs.dweb.link',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Optimize for Vercel deployment
  webpack: (config) => {
    // Exclude problematic libraries from client-side bundle
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    // Handle Node.js modules in browser environment
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },
  // Exclude server-only packages
  serverExternalPackages: ["hardhat"],
  
  // Enable static exports for better performance (optional)
  output: 'standalone',
  
  // Optimize for production
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
