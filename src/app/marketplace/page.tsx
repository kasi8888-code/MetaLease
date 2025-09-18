'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import { Clock, User, Filter, Search, Grid, List, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { ipfsService } from '@/services/ipfs';
import { useNFTStore } from '@/hooks/useNFTStore';

interface NFTListing {
  id: string;
  tokenId: number;
  name: string;
  description: string;
  image: string;
  owner: string;
  hourlyRate: string;
  dailyRate: string;
  minRentalHours: number;
  maxRentalHours: number;
  isAvailable: boolean;
  category: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export default function Marketplace() {
  const { isConnected } = useAccount();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  // Smart contract hooks (for future use when smart contracts are deployed)
  // const { listingIds, isLoading: loadingListings } = useMarketplaceListings();
  // const { rent, isLoading: isRenting } = useRentNFT();
  const [isRenting, setIsRenting] = useState(false);
  
  // NFT Store
  const { allNFTs, addRental, generateId } = useNFTStore();

  const categories = ['All', 'Gaming', 'Art', 'Metaverse', 'Music', 'Utility', 'Collectibles'];

  // Convert store NFTs to listing format - show all NFTs that are listed for rent
  const listings: NFTListing[] = allNFTs
    .filter(nft => nft.isListed) // Only show listed NFTs
    .map(nft => ({
      id: nft.id,
      tokenId: nft.tokenId,
      name: nft.name,
      description: nft.description,
      image: nft.image.startsWith('Qm') ? ipfsService.getImageUrl(nft.image) : nft.image,
      owner: nft.owner,
      hourlyRate: nft.hourlyRate || '0.001',
      dailyRate: nft.dailyRate || '0.02',
      minRentalHours: nft.minRentalHours || 1,
      maxRentalHours: nft.maxRentalHours || 168,
      isAvailable: nft.isListed,
      category: nft.category,
      attributes: nft.attributes,
    }));

  const [filteredListings, setFilteredListings] = useState<NFTListing[]>([]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let filtered = listings;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(listing => listing.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(listing =>
        listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort listings
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.hourlyRate) - parseFloat(b.hourlyRate);
        case 'price-high':
          return parseFloat(b.hourlyRate) - parseFloat(a.hourlyRate);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredListings(filtered);
  }, [listings, searchTerm, selectedCategory, sortBy]);

  const handleRent = async (listing: NFTListing, duration: number, isHourly: boolean) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    const rate = isHourly ? listing.hourlyRate : listing.dailyRate;
    const cost = parseFloat(rate) * (isHourly ? duration : duration / 24);
    
    const loadingToast = toast.loading('Processing rental...');
    setIsRenting(true);
    
    try {
      // For demo purposes, we'll simulate the rental
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create rental record
      const rentalId = generateId();
      const startTime = Date.now();
      const endTime = startTime + (duration * (isHourly ? 3600000 : 86400000));
      
      addRental({
        id: rentalId,
        nftId: listing.id,
        tokenId: listing.tokenId,
        listingId: parseInt(listing.id.replace(/\D/g, '')) || 0,
        renter: '0xCurrentUser...Address', // In real app, would use connected address
        owner: listing.owner,
        startTime,
        endTime,
        hourlyRate: listing.hourlyRate,
        totalCost: cost.toString(),
        isActive: true,
      });
      
      toast.success(`Successfully rented ${listing.name} for ${duration} ${isHourly ? 'hours' : 'days'}!`, { id: loadingToast });
      
    } catch (error) {
      console.error('Rental error:', error);
      toast.error('Failed to rent NFT. Please try again.', { id: loadingToast });
    } finally {
      setIsRenting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading marketplace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              NFT Marketplace
            </span>
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Discover and rent amazing NFTs for your needs
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search NFTs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              {/* View Mode */}
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredListings.length} of {listings.length} NFTs available for rent
            {listings.length === 0 && (
              <span className="ml-2 text-blue-600">- Create some NFTs to get started!</span>
            )}
          </p>
        </div>

        {/* NFT Grid/List */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {filteredListings.map((listing, index) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              <div className={viewMode === 'list' ? 'flex-shrink-0' : ''}>
                <Image
                  src={listing.image}
                  alt={listing.name}
                  width={viewMode === 'list' ? 200 : 400}
                  height={viewMode === 'list' ? 200 : 400}
                  className={`${
                    viewMode === 'list' 
                      ? 'w-48 h-48 object-cover' 
                      : 'w-full h-64 object-cover'
                  }`}
                />
              </div>
              
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {listing.name}
                    </h3>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {listing.category}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {listing.description}
                </p>

                <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>{listing.owner}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-blue-600 font-bold mr-1">Ξ</span>
                      <span className="font-semibold">{listing.hourlyRate} ETH/hr</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-600 font-bold mr-1">Ξ</span>
                      <span className="font-semibold">{listing.dailyRate} ETH/day</span>
                    </div>
                  </div>

                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>
                      Min: {listing.minRentalHours}h | Max: {listing.maxRentalHours}h
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRent(listing, 1, true)}
                      disabled={!isConnected || !listing.isAvailable || isRenting}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm flex items-center justify-center"
                    >
                      {isRenting ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4 mr-1" />
                          Renting...
                        </>
                      ) : (
                        'Rent Hourly'
                      )}
                    </button>
                    <button
                      onClick={() => handleRent(listing, 24, false)}
                      disabled={!isConnected || !listing.isAvailable || isRenting}
                      className="flex-1 bg-white border-2 border-blue-600 text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm flex items-center justify-center"
                    >
                      {isRenting ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4 mr-1" />
                          Renting...
                        </>
                      ) : (
                        'Rent Daily'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <Filter className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No NFTs found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}