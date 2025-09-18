'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Calendar, Clock, TrendingUp, Wallet, Eye, DollarSign, Activity, Plus } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useUserNFTs, useUserRentals } from '@/hooks/useBlockchainData';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { userNFTs, isLoading: loadingNFTs } = useUserNFTs();
  const { userRentals, isLoading: loadingRentals } = useUserRentals();
  const [activeTab, setActiveTab] = useState<'owned' | 'rented' | 'earnings'>('owned');

  // Use real data from hooks
  const displayOwnedNFTs = userNFTs || [];
  const displayRentedNFTs = userRentals || [];

  const formatTimeRemaining = (endTime: number) => {
    const remaining = endTime - Date.now();
    if (remaining <= 0) return 'Expired';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  };

  const totalEarnings = displayOwnedNFTs.reduce((sum, nft) => sum + parseFloat(nft.totalEarnings || '0'), 0);
  const totalRentals = displayOwnedNFTs.reduce((sum, nft) => sum + (nft.totalRentals || 0), 0);
  const activeRentals = displayOwnedNFTs.filter(nft => nft.currentlyRented).length;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <Wallet className="h-24 w-24 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600">Connect your wallet to view your NFT dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Manage your NFT rentals and earnings</p>
            <p className="text-sm text-gray-500 mt-2">Connected: {address}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href="/create"
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create NFT
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-3xl font-bold text-green-600">{totalEarnings.toFixed(4)} ETH</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Owned NFTs</p>
                <p className="text-3xl font-bold text-blue-600">{displayOwnedNFTs.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Rentals</p>
                <p className="text-3xl font-bold text-purple-600">{activeRentals}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rentals</p>
                <p className="text-3xl font-bold text-orange-600">{totalRentals}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('owned')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'owned'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My NFTs ({displayOwnedNFTs.length})
              </button>
              <button
                onClick={() => setActiveTab('rented')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rented'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Rented NFTs ({displayRentedNFTs.length})
              </button>
              <button
                onClick={() => setActiveTab('earnings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'earnings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Earnings History
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'owned' && (
          <div>
            {loadingNFTs ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading your NFTs...</span>
              </div>
            ) : displayOwnedNFTs.length === 0 ? (
              <div className="text-center py-12">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No NFTs Found</h3>
                <p className="text-gray-600 mb-6">Create your first NFT to get started!</p>
                <Link
                  href="/create"
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First NFT
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayOwnedNFTs.map((nft, index) => (
                  <div key={nft.tokenId || index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">NFT Image</span>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{nft.name}</h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Earnings</span>
                          <span className="font-semibold text-green-600">{nft.totalEarnings || '0.000'} ETH</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Rentals</span>
                          <span className="font-semibold">{nft.totalRentals || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Hourly Rate</span>
                          <span className="font-semibold text-blue-600">{nft.hourlyRate || '0.001'} ETH</span>
                        </div>
                      </div>

                      {nft.currentlyRented && nft.rentalEndTime && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center text-green-700 text-sm">
                            <Clock className="h-4 w-4 mr-2" />
                            Currently Rented - {formatTimeRemaining(nft.rentalEndTime)}
                          </div>
                        </div>
                      )}

                      {!nft.currentlyRented && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center text-gray-600 text-sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            Available for Rent
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'rented' && (
          <div>
            {loadingRentals ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading your rentals...</span>
              </div>
            ) : displayRentedNFTs.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Rentals</h3>
                <p className="text-gray-600 mb-6">Visit the marketplace to rent an NFT!</p>
                <Link
                  href="/marketplace"
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Browse Marketplace
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayRentedNFTs.map((rental, index) => (
                  <div key={rental.id || index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">NFT Image</span>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{rental.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">by {rental.owner}</p>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Rental Ends</span>
                          <span className="font-semibold text-red-600">{formatTimeRemaining(rental.rentalEnd)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Paid</span>
                          <span className="font-semibold text-blue-600">{rental.totalPaid} ETH</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Hourly Rate</span>
                          <span className="font-semibold">{rental.hourlyRate} ETH</span>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center text-blue-700 text-sm">
                          <Activity className="h-4 w-4 mr-2" />
                          Active Rental
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Earnings History</h3>
            
            <div className="space-y-4">
              {/* Mock earnings data */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Cool Cat #1234 Rental</p>
                  <p className="text-sm text-gray-500">24 hours rental completed</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">+0.024 ETH</p>
                  <p className="text-sm text-gray-500">2 days ago</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Digital Art #5678 Rental</p>
                  <p className="text-sm text-gray-500">48 hours rental completed</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">+0.096 ETH</p>
                  <p className="text-sm text-gray-500">1 week ago</p>
                </div>
              </div>

              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                <p>More earnings history will appear here as you rent out your NFTs</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}