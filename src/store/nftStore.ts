interface NFTData {
  id: string;
  tokenId: number;
  name: string;
  description: string;
  image: string;
  owner: string;
  creator: string;
  tokenURI: string;
  isListed: boolean;
  listingId?: number;
  hourlyRate?: string;
  dailyRate?: string;
  minRentalHours?: number;
  maxRentalHours?: number;
  category: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  createdAt: number;
}

interface RentalData {
  id: string;
  nftId: string;
  tokenId: number;
  listingId: number;
  renter: string;
  owner: string;
  startTime: number;
  endTime: number;
  hourlyRate: string;
  totalCost: string;
  isActive: boolean;
  transactionHash?: string;
}

class NFTStore {
  private nfts: Map<string, NFTData> = new Map();
  private rentals: Map<string, RentalData> = new Map();
  private listeners: Set<() => void> = new Set();

  // Subscribe to store changes
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  // NFT Management
  addNFT(nft: NFTData) {
    this.nfts.set(nft.id, nft);
    this.saveToStorage();
    this.notify();
  }

  updateNFT(id: string, updates: Partial<NFTData>) {
    const nft = this.nfts.get(id);
    if (nft) {
      this.nfts.set(id, { ...nft, ...updates });
      this.saveToStorage();
      this.notify();
    }
  }

  getNFT(id: string): NFTData | undefined {
    return this.nfts.get(id);
  }

  getAllNFTs(): NFTData[] {
    return Array.from(this.nfts.values());
  }

  getUserNFTs(userAddress: string): NFTData[] {
    return Array.from(this.nfts.values()).filter(
      nft => nft.owner.toLowerCase() === userAddress.toLowerCase()
    );
  }

  getAvailableNFTs(): NFTData[] {
    return Array.from(this.nfts.values()).filter(nft => nft.isListed);
  }

  // Rental Management
  addRental(rental: RentalData) {
    this.rentals.set(rental.id, rental);
    // Update NFT availability
    const nft = this.nfts.get(rental.nftId);
    if (nft) {
      this.updateNFT(rental.nftId, { isListed: false });
    }
    this.saveToStorage();
    this.notify();
  }

  updateRental(id: string, updates: Partial<RentalData>) {
    const rental = this.rentals.get(id);
    if (rental) {
      this.rentals.set(id, { ...rental, ...updates });
      
      // If rental is ended, make NFT available again
      if (updates.isActive === false) {
        const nft = this.nfts.get(rental.nftId);
        if (nft) {
          this.updateNFT(rental.nftId, { isListed: true });
        }
      }
      
      this.saveToStorage();
      this.notify();
    }
  }

  getRental(id: string): RentalData | undefined {
    return this.rentals.get(id);
  }

  getAllRentals(): RentalData[] {
    return Array.from(this.rentals.values());
  }

  getUserRentals(userAddress: string): RentalData[] {
    return Array.from(this.rentals.values()).filter(
      rental => rental.renter.toLowerCase() === userAddress.toLowerCase()
    );
  }

  getActiveRentals(): RentalData[] {
    const now = Date.now();
    return Array.from(this.rentals.values()).filter(
      rental => rental.isActive && rental.endTime > now
    );
  }

  // Expire rentals that have passed their end time
  expireOldRentals() {
    const now = Date.now();
    const expiredRentals = Array.from(this.rentals.values()).filter(
      rental => rental.isActive && rental.endTime <= now
    );

    expiredRentals.forEach(rental => {
      this.updateRental(rental.id, { isActive: false });
    });

    if (expiredRentals.length > 0) {
      console.log(`Expired ${expiredRentals.length} rentals`);
    }
  }

  // Storage Management
  private saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        const data = {
          nfts: Array.from(this.nfts.entries()),
          rentals: Array.from(this.rentals.entries()),
          lastUpdated: Date.now()
        };
        localStorage.setItem('metalease-store', JSON.stringify(data));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    }
  }

  loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('metalease-store');
        if (stored) {
          const data = JSON.parse(stored);
          this.nfts = new Map(data.nfts || []);
          this.rentals = new Map(data.rentals || []);
          
          // Expire old rentals on load
          this.expireOldRentals();
          
          this.notify();
        }
      } catch (error) {
        console.error('Failed to load from localStorage:', error);
      }
    }
  }

  // Utility methods
  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  isNFTAvailable(nftId: string): boolean {
    const nft = this.nfts.get(nftId);
    if (!nft || !nft.isListed) return false;

    // Check if currently rented
    const activeRental = Array.from(this.rentals.values()).find(
      rental => rental.nftId === nftId && rental.isActive && rental.endTime > Date.now()
    );

    return !activeRental;
  }

  getRentalTimeRemaining(rentalId: string): number {
    const rental = this.rentals.get(rentalId);
    if (!rental || !rental.isActive) return 0;
    
    return Math.max(0, rental.endTime - Date.now());
  }

  // Demo data initialization
  initializeDemoData() {
    // Add some demo NFTs
    const demoNFTs: NFTData[] = [
      {
        id: 'demo-1',
        tokenId: 1,
        name: 'Cyber Warrior #001',
        description: 'A powerful cyber warrior with enhanced combat abilities',
        image: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400',
        owner: '0x1234...5678',
        creator: '0x1234...5678',
        tokenURI: 'ipfs://demo1',
        isListed: true,
        hourlyRate: '0.001',
        dailyRate: '0.02',
        minRentalHours: 1,
        maxRentalHours: 168,
        category: 'Gaming',
        attributes: [
          { trait_type: 'Rarity', value: 'Legendary' },
          { trait_type: 'Power', value: '95' },
        ],
        createdAt: Date.now() - 86400000, // 1 day ago
      },
      {
        id: 'demo-2',
        tokenId: 2,
        name: 'Digital Art #042',
        description: 'Abstract digital artwork perfect for exhibitions',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
        owner: '0xabcd...efgh',
        creator: '0xabcd...efgh',
        tokenURI: 'ipfs://demo2',
        isListed: true,
        hourlyRate: '0.0005',
        dailyRate: '0.01',
        minRentalHours: 24,
        maxRentalHours: 720,
        category: 'Art',
        attributes: [
          { trait_type: 'Style', value: 'Abstract' },
          { trait_type: 'Medium', value: 'Digital' },
        ],
        createdAt: Date.now() - 172800000, // 2 days ago
      }
    ];

    demoNFTs.forEach(nft => this.addNFT(nft));
  }
}

// Create and export singleton instance
export const nftStore = new NFTStore();

// Initialize demo data and load from storage on first import
if (typeof window !== 'undefined') {
  nftStore.loadFromStorage();
  
  // If no stored data, initialize with demo data
  if (nftStore.getAllNFTs().length === 0) {
    nftStore.initializeDemoData();
  }

  // Check for expired rentals every minute
  setInterval(() => {
    nftStore.expireOldRentals();
  }, 60000);
}

// Export types
export type { NFTData, RentalData };