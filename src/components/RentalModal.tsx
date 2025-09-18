// components/RentalModal.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { X, Clock, Calculator, ExternalLink, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { useRentNFT, MarketplaceListing } from '@/hooks/useBlockchainData';

interface RentalModalProps {
  listing: MarketplaceListing;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (txHash: string) => void;
}

export default function RentalModal({ listing, isOpen, onClose, onSuccess }: RentalModalProps) {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { rentNFT, rentalState, getEtherscanUrl, reset } = useRentNFT();
  
  const [rentalHours, setRentalHours] = useState(24);
  const [useHourlyRate, setUseHourlyRate] = useState(true);
  const [totalCost, setTotalCost] = useState('0');
  const [platformFee, setPlatformFee] = useState('0');
  const [ownerReceives, setOwnerReceives] = useState('0');

  // Calculate costs whenever rental hours or rate type changes
  const calculateCosts = useCallback(() => {
    let cost = 0;
    
    if (useHourlyRate) {
      cost = parseFloat(listing.hourlyRate) * rentalHours;
    } else {
      const days = Math.ceil(rentalHours / 24);
      cost = parseFloat(listing.dailyRate) * days;
    }
    
    const platformFeeAmount = cost * 0.025; // 2.5% platform fee
    const ownerReceivesAmount = cost - platformFeeAmount;
    
    setTotalCost(cost.toFixed(6));
    setPlatformFee(platformFeeAmount.toFixed(6));
    setOwnerReceives(ownerReceivesAmount.toFixed(6));
  }, [listing.hourlyRate, listing.dailyRate, rentalHours, useHourlyRate]);

  useEffect(() => {
    calculateCosts();
  }, [calculateCosts]);

  const handleRent = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!balance || parseFloat(formatEther(balance.value)) < parseFloat(totalCost)) {
      toast.error('Insufficient ETH balance');
      return;
    }

    try {
      await rentNFT(listing.listingId, rentalHours, useHourlyRate);
    } catch (error) {
      console.error('Rental failed:', error);
      toast.error('Rental failed. Please try again.');
    }
  };

  // Handle success
  useEffect(() => {
    if (rentalState.stage === 'success' && rentalState.txHash) {
      toast.success('NFT rented successfully!');
      onSuccess(rentalState.txHash);
      setTimeout(() => {
        reset();
        onClose();
      }, 3000);
    }
  }, [rentalState, onSuccess, onClose, reset]);

  // Handle error
  useEffect(() => {
    if (rentalState.stage === 'error') {
      toast.error(rentalState.error || 'Rental failed');
    }
  }, [rentalState]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Rent NFT</h3>
          <button
            onClick={onClose}
            disabled={rentalState.stage === 'confirming' || rentalState.stage === 'processing'}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* NFT Info */}
          <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
              {listing.image ? (
                <img 
                  src={listing.image} 
                  alt={listing.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-xs text-gray-500">NFT</span>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{listing.name}</h4>
              <p className="text-sm text-gray-500">by {listing.owner.slice(0, 6)}...{listing.owner.slice(-4)}</p>
            </div>
          </div>

          {/* Rate Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Rate Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setUseHourlyRate(true)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  useHourlyRate 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">Hourly Rate</div>
                <div className="text-sm text-blue-600 font-semibold">{listing.hourlyRate} ETH/hour</div>
              </button>
              <button
                onClick={() => setUseHourlyRate(false)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  !useHourlyRate 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">Daily Rate</div>
                <div className="text-sm text-blue-600 font-semibold">{listing.dailyRate} ETH/day</div>
              </button>
            </div>
          </div>

          {/* Duration Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rental Duration
            </label>
            <div className="relative">
              <input
                type="number"
                min={listing.minHours || 1}
                max={listing.maxHours || 168}
                value={rentalHours}
                onChange={(e) => setRentalHours(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-16"
                placeholder="Enter hours"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Min: {listing.minHours || 1}h</span>
              <span>Max: {listing.maxHours || 168}h</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Duration: {rentalHours <= 24 ? `${rentalHours} hours` : `${Math.floor(rentalHours / 24)} days ${rentalHours % 24} hours`}
            </p>
          </div>

          {/* Cost Breakdown */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Calculator className="h-4 w-4 mr-2" />
                Cost Breakdown
              </h4>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Rate ({useHourlyRate ? 'Hourly' : 'Daily'})</span>
                <span>{useHourlyRate ? listing.hourlyRate : listing.dailyRate} ETH</span>
              </div>
              <div className="flex justify-between">
                <span>Duration</span>
                <span>{useHourlyRate ? rentalHours : Math.ceil(rentalHours / 24)} {useHourlyRate ? 'hours' : 'days'}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{totalCost} ETH</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Platform Fee (2.5%)</span>
                <span>{platformFee} ETH</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Owner Receives</span>
                <span>{ownerReceives} ETH</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span>Total Cost</span>
                <span className="text-blue-600">{totalCost} ETH</span>
              </div>
            </div>
          </div>

          {/* Balance Check */}
          {balance && (
            <div className="mb-6 p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Your Balance:</span>
                <span className="font-medium">{parseFloat(formatEther(balance.value)).toFixed(6)} ETH</span>
              </div>
              {parseFloat(formatEther(balance.value)) < parseFloat(totalCost) && (
                <p className="text-red-600 text-xs mt-1">Insufficient balance for this rental</p>
              )}
            </div>
          )}

          {/* Transaction Status */}
          {rentalState.stage !== 'idle' && (
            <div className="mb-6 p-4 rounded-lg border">
              {rentalState.stage === 'confirming' && (
                <div className="flex items-center space-x-3 text-blue-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Waiting for wallet confirmation...</span>
                </div>
              )}
              
              {rentalState.stage === 'processing' && (
                <div className="flex items-center space-x-3 text-blue-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing transaction...</span>
                </div>
              )}
              
              {rentalState.stage === 'success' && (
                <div className="text-green-600">
                  <div className="flex items-center space-x-3 mb-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Rental successful!</span>
                  </div>
                  {rentalState.txHash && (
                    <a
                      href={getEtherscanUrl(rentalState.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View on Etherscan</span>
                    </a>
                  )}
                </div>
              )}
              
              {rentalState.stage === 'error' && (
                <div className="flex items-center space-x-3 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>{rentalState.error}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={rentalState.stage === 'confirming' || rentalState.stage === 'processing'}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleRent}
              disabled={
                !isConnected || 
                rentalState.stage === 'confirming' || 
                rentalState.stage === 'processing' ||
                rentalState.stage === 'success' ||
                (balance && parseFloat(formatEther(balance.value)) < parseFloat(totalCost))
              }
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {rentalState.stage === 'confirming' && (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Confirming...
                </>
              )}
              {rentalState.stage === 'processing' && (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              )}
              {rentalState.stage === 'success' && (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Success!
                </>
              )}
              {(rentalState.stage === 'idle' || rentalState.stage === 'error') && (
                <>
                  Rent for {totalCost} ETH
                </>
              )}
            </button>
          </div>

          {/* Etherscan Link */}
          {rentalState.txHash && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Transaction Hash:</div>
              <div className="flex items-center space-x-2">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                  {rentalState.txHash}
                </code>
                <a
                  href={getEtherscanUrl(rentalState.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}