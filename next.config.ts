import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude hardhat and blockchain libraries from the build
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  // Exclude hardhat files from being processed
  serverExternalPackages: ["hardhat"],
};

export default nextConfig;
