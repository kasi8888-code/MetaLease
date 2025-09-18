import { useState, useEffect } from 'react';
import { nftStore, NFTData, RentalData } from '@/store/nftStore';
import { useAccount } from 'wagmi';

export const useNFTStore = () => {
  const [nfts, setNFTs] = useState<NFTData[]>([]);
  const [rentals, setRentals] = useState<RentalData[]>([]);
  const { address } = useAccount();

  useEffect(() => {
    // Initial load
    setNFTs(nftStore.getAllNFTs());
    setRentals(nftStore.getAllRentals());

    // Subscribe to changes
    const unsubscribe = nftStore.subscribe(() => {
      setNFTs(nftStore.getAllNFTs());
      setRentals(nftStore.getAllRentals());
    });

    return unsubscribe;
  }, []);

  return {
    // NFT methods
    allNFTs: nfts,
    availableNFTs: nfts.filter(nft => nft.isListed && nftStore.isNFTAvailable(nft.id)),
    userNFTs: address ? nfts.filter(nft => nft.owner.toLowerCase() === address.toLowerCase()) : [],
    addNFT: (nft: NFTData) => nftStore.addNFT(nft),
    updateNFT: (id: string, updates: Partial<NFTData>) => nftStore.updateNFT(id, updates),
    getNFT: (id: string) => nftStore.getNFT(id),
    
    // Rental methods
    allRentals: rentals,
    activeRentals: rentals.filter(rental => rental.isActive && rental.endTime > Date.now()),
    userRentals: address ? rentals.filter(rental => rental.renter.toLowerCase() === address.toLowerCase()) : [],
    addRental: (rental: RentalData) => nftStore.addRental(rental),
    updateRental: (id: string, updates: Partial<RentalData>) => nftStore.updateRental(id, updates),
    getRental: (id: string) => nftStore.getRental(id),
    
    // Utility methods
    generateId: () => nftStore.generateId(),
    isNFTAvailable: (nftId: string) => nftStore.isNFTAvailable(nftId),
    getRentalTimeRemaining: (rentalId: string) => nftStore.getRentalTimeRemaining(rentalId),
    expireOldRentals: () => nftStore.expireOldRentals(),
  };
};