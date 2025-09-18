'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import { 
  Wallet, 
  Calendar, 
  Clock, 
  TrendingUp, 
  User, 
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useNFTStore } from '@/hooks/useNFTStore';
import { ipfsService } from '@/services/ipfs';
import type { RentalData } from '@/store/nftStore';

interface OwnedNFT {
  id: string;
  tokenId: number;
  name: string;
  image: string;
  isListed: boolean;
  hourlyRate?: string;
  dailyRate?: string;
  currentRenter?: string;
  rentalEndTime?: number;
  totalEarned: string;
}

interface RentedNFT {
  id: string;
  tokenId: number;
  name: string;
  image: string;
  owner: string;
  rentalStartTime: number;
  rentalEndTime: number;
  totalCost: string;
  isActive: boolean;
}

// Mock data
// Removed - now using real NFT store data

export default function Dashboard() {
  const { isConnected, address } = useAccount();
  const [activeTab, setActiveTab] = useState<'owned' | 'rented'>('owned');
  const [isLoading, setIsLoading] = useState(true);
  
  // Get data from NFT store
  const { allNFTs, allRentals, updateNFT } = useNFTStore();
  
  // Filter NFTs owned by current user (for demo, we'll show all created NFTs)
  const ownedNFTs: OwnedNFT[] = allNFTs.map(nft => {
    // Find active rental for this NFT
    const activeRental = allRentals.find((r: RentalData) => r.nftId === nft.id && r.isActive);
    
    return {
      id: nft.id,
      tokenId: nft.tokenId,
      name: nft.name,
      image: nft.image.startsWith('Qm') ? ipfsService.getImageUrl(nft.image) : nft.image,
      isListed: nft.isListed,
      hourlyRate: nft.hourlyRate,
      dailyRate: nft.dailyRate,
      currentRenter: activeRental?.renter,
      rentalEndTime: activeRental?.endTime,
      totalEarned: '0.00', // TODO: Calculate from rental history
    };
  });
  
  // Filter rentals for current user (for demo, we'll show all rentals)
  const rentedNFTs: RentedNFT[] = allRentals.map((rental: RentalData) => {
    const nft = allNFTs.find(n => n.id === rental.nftId);
    if (!nft) return null;
    
    return {
      id: rental.id,
      tokenId: rental.tokenId,
      name: nft.name,
      image: nft.image.startsWith('Qm') ? ipfsService.getImageUrl(nft.image) : nft.image,
      owner: rental.owner,
      rentalStartTime: rental.startTime,
      rentalEndTime: rental.endTime,
      totalCost: rental.totalCost,
      isActive: rental.isActive,
    };
  }).filter(Boolean) as RentedNFT[];

  useEffect(() => {
    if (isConnected) {
      // Data is loaded from NFT store, just set loading to false
      setIsLoading(false);
    }
  }, [isConnected]);

  const handleListForRent = (nftId: string) => {
    // For now, just show success message - in real app would open modal
    const nft = allNFTs.find(n => n.id === nftId);
    if (nft && !nft.isListed) {
      updateNFT(nftId, {
        ...nft,
        isListed: true,
        hourlyRate: '0.001',
        dailyRate: '0.02',
        minRentalHours: 1,
        maxRentalHours: 168,
      });
      toast.success('NFT listed for rent successfully!');
    } else {
      toast.success('Listing modal would open here to edit rates');
    }
  };

  const handleUnlist = (nftId: string) => {
    const nft = allNFTs.find(n => n.id === nftId);
    if (nft) {
      updateNFT(nftId, {
        ...nft,
        isListed: false,
      });
      toast.success('NFT unlisted successfully');
    }
  };

  const handleReturnEarly = (_rentalId: string) => {
    // In a real app, this would interact with smart contracts
    // For now, we'll just show a success message
    toast.success('Early return functionality would be implemented here');
  };

  const formatTimeRemaining = (endTime: number) => {
    const remaining = endTime - Date.now();
    if (remaining <= 0) return 'Expired';
    
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const totalEarned = ownedNFTs.reduce((sum, nft) => sum + parseFloat(nft.totalEarned), 0);
  const totalSpent = rentedNFTs.reduce((sum, nft) => sum + parseFloat(nft.totalCost), 0);
  const activeRentals = rentedNFTs.filter(nft => nft.isActive).length;
  const listedNFTs = ownedNFTs.filter(nft => nft.isListed).length;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Wallet className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600">Please connect your wallet to view your dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
            <Link
              href="/create"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create NFT
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earned</p>
                <p className="text-2xl font-bold text-gray-900">Ξ{totalEarned.toFixed(3)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">Ξ{totalSpent.toFixed(3)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Rentals</p>
                <p className="text-2xl font-bold text-gray-900">{activeRentals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Settings className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Listed NFTs</p>
                <p className="text-2xl font-bold text-gray-900">{listedNFTs}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('owned')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'owned'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My NFTs ({ownedNFTs.length})
              </button>
              <button
                onClick={() => setActiveTab('rented')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'rented'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Rented NFTs ({rentedNFTs.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'owned' && (
              <div className="space-y-4">
                {ownedNFTs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <User className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No NFTs found</h3>
                    <p className="text-gray-500 mb-4">
                      Create your first NFT to get started
                    </p>
                    <Link
                      href="/create"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create NFT
                    </Link>
                  </div>
                ) : (
                  ownedNFTs.map((nft) => (
                    <div key={nft.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
                      <Image
                        src={nft.image}
                        alt={nft.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      
                      <div className="ml-4 flex-1">
                        <h3 className="font-semibold text-gray-900">{nft.name}</h3>
                        <p className="text-sm text-gray-600">Token ID: {nft.tokenId}</p>
                        
                        {nft.isListed && nft.currentRenter ? (
                          <div className="mt-2">
                            <div className="flex items-center text-sm text-green-600 mb-1">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>Rented by {nft.currentRenter}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              Time remaining: {formatTimeRemaining(nft.rentalEndTime!)}
                            </div>
                          </div>
                        ) : nft.isListed ? (
                          <div className="text-sm text-blue-600 mt-2">
                            Listed for rent (Ξ{nft.hourlyRate}/hr, Ξ{nft.dailyRate}/day)
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 mt-2">Not listed</div>
                        )}
                        
                        <div className="text-sm text-gray-600 mt-1">
                          Total earned: Ξ{nft.totalEarned}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {nft.isListed && !nft.currentRenter ? (
                          <>
                            <button
                              onClick={() => handleListForRent(nft.id)}
                              className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleUnlist(nft.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : !nft.currentRenter ? (
                          <button
                            onClick={() => handleListForRent(nft.id)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
                          >
                            List for Rent
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'rented' && (
              <div className="space-y-4">
                {rentedNFTs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Calendar className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No active rentals</h3>
                    <p className="text-gray-500 mb-4">
                      Browse the marketplace to rent NFTs
                    </p>
                    <Link
                      href="/marketplace"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Browse Marketplace
                    </Link>
                  </div>
                ) : (
                  rentedNFTs.map((nft) => (
                    <div key={nft.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
                      <Image
                        src={nft.image}
                        alt={nft.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      
                      <div className="ml-4 flex-1">
                        <h3 className="font-semibold text-gray-900">{nft.name}</h3>
                        <p className="text-sm text-gray-600">Owner: {nft.owner}</p>
                        
                        <div className="mt-2">
                          {nft.isActive ? (
                            <div className="flex items-center text-sm text-green-600 mb-1">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>Active rental</span>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 mb-1">Rental ended</div>
                          )}
                          
                          <div className="text-sm text-gray-600">
                            {nft.isActive ? (
                              <>Time remaining: {formatTimeRemaining(nft.rentalEndTime)}</>
                            ) : (
                              <>Ended: {new Date(nft.rentalEndTime).toLocaleDateString()}</>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 mt-1">
                          Total cost: Ξ{nft.totalCost}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {nft.isActive && (
                          <button
                            onClick={() => handleReturnEarly(nft.id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors duration-200"
                          >
                            Return Early
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}