'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import { Clock, Star, User, Filter, Search, Zap, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import RentalModal from '@/components/RentalModal';
import { useMarketplaceListings } from '@/hooks/useBlockchainData';

export default function Marketplace() {
  const { isConnected } = useAccount();
  const { listings, isLoading, error } = useMarketplaceListings();
  const [selectedListing, setSelectedListing] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentRentals, setRecentRentals] = useState<string[]>([]);

  const handleRentalSuccess = (txHash: string) => {
    setRecentRentals(prev => [txHash, ...prev].slice(0, 5)); // Keep last 5 transactions
    toast.success('🎉 NFT rented successfully! Check your dashboard.');
    setSelectedListing(null);
  };

  const displayListings = listings; // Use real listings from hook

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">NFT Rental Marketplace</h1>
          <p className="text-gray-600 text-lg">Discover and rent unique digital assets</p>
          <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {displayListings.length} Available
            </span>
            <span className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              Active Marketplace
            </span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search NFTs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading real marketplace data from Pinata...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-12 w-12 text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Marketplace</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : displayListings.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No NFTs Found</h3>
              <p className="text-gray-600 mb-4">No MetaLease NFTs found on Pinata. Create your first NFT to get started!</p>
              <a 
                href="/create"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Create NFT
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayListings.map((listing, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                {/* NFT Image */}
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">NFT Image</span>
                  </div>
                </div>
                
                {/* NFT Details */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{listing.name}</h3>
                      <p className="text-sm text-gray-500">by {listing.owner}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{listing.rating}</span>
                      <span className="text-xs text-gray-500">({listing.rentals})</span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Hourly Rate</span>
                      <span className="font-semibold text-blue-600">{listing.hourlyRate} ETH</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Daily Rate</span>
                      <span className="font-semibold text-blue-600">{listing.dailyRate} ETH</span>
                    </div>
                  </div>

                  {/* Rental Terms */}
                  <div className="flex justify-between text-xs text-gray-500 mb-4">
                    <span>Min: {listing.minHours}h</span>
                    <span>Max: {listing.maxHours}h</span>
                  </div>

                  {/* Rent Button */}
                  <button
                    onClick={() => setSelectedListing(index)}
                    disabled={!isConnected}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  >
                    <Zap className="h-5 w-5 mr-2" />
                    {isConnected ? 'Rent Now' : 'Connect Wallet'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Rentals */}
        {recentRentals.length > 0 && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-3">Recent Rental Transactions</h3>
            <div className="space-y-2">
              {recentRentals.map((txHash, index) => (
                <div key={txHash} className="flex items-center justify-between text-sm">
                  <span className="text-green-700">Rental #{index + 1}</span>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                  >
                    <span>View on Etherscan</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Rental Modal */}
        {selectedListing !== null && (
          <RentalModal
            listing={displayListings[selectedListing]}
            isOpen={selectedListing !== null}
            onClose={() => setSelectedListing(null)}
            onSuccess={handleRentalSuccess}
          />
        )}
      </div>
    </div>
  );
}