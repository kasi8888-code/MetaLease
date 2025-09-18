import axios from 'axios';

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

class IPFSService {
  private pinataJWT: string;
  private pinataApiKey: string;
  private pinataSecretKey: string;
  private gateway: string;

  constructor() {
    // Prefer JWT authentication (recommended by Pinata)
    this.pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT || process.env.PINATA_JWT || '';
    
    // Fallback to legacy API keys
    this.pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY || process.env.PINATA_API_KEY || '';
    this.pinataSecretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || process.env.PINATA_SECRET_KEY || '';
    
    this.gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';
  }

  private getAuthHeaders(): Record<string, string> {
    if (this.pinataJWT) {
      // Use JWT authentication (recommended)
      return {
        'Authorization': `Bearer ${this.pinataJWT}`,
      };
    } else if (this.pinataApiKey && this.pinataSecretKey) {
      // Fallback to legacy API key authentication
      return {
        'pinata_api_key': this.pinataApiKey,
        'pinata_secret_api_key': this.pinataSecretKey,
      };
    }
    return {};
  }

  private async fetchMetadataFromIPFS(hash: string): Promise<NFTMetadata | null> {
    try {
      const response = await axios.get(`${this.gateway}${hash}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching metadata from IPFS:', error);
      return null;
    }
  }

  private hasValidCredentials(): boolean {
    return !!(this.pinataJWT || (this.pinataApiKey && this.pinataSecretKey));
  }

  async uploadImageToIPFS(file: File): Promise<string> {
    try {
      if (!this.hasValidCredentials()) {
        console.warn('IPFS credentials not configured, using mock upload');
        return this.mockImageUpload();
      }

      const formData = new FormData();
      formData.append('file', file);

      const pinataMetadata = JSON.stringify({
        name: `NFT-Image-${Date.now()}`,
        keyvalues: {
          type: 'nft-image',
          filename: file.name
        }
      });
      formData.append('pinataMetadata', pinataMetadata);

      const pinataOptions = JSON.stringify({
        cidVersion: 1, // Use CIDv1 for better compatibility
      });
      formData.append('pinataOptions', pinataOptions);

      const headers = this.getAuthHeaders();

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.IpfsHash) {
        throw new Error('Invalid response: missing IpfsHash');
      }

      console.log(`✅ Image uploaded to IPFS: ${result.IpfsHash}`);
      return result.IpfsHash;

    } catch (error) {
      console.error('Error uploading image to IPFS:', error);
      // Fallback to mock upload
      return this.mockImageUpload();
    }
  }

  async uploadMetadataToIPFS(metadata: NFTMetadata): Promise<string> {
    try {
      if (!this.hasValidCredentials()) {
        console.warn('IPFS credentials not configured, using mock upload');
        return this.mockMetadataUpload(metadata);
      }

      const headers = {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      };

      const payload = {
        pinataContent: metadata,
        pinataMetadata: {
          name: `NFT-Metadata-${Date.now()}`,
          keyvalues: {
            type: 'nft-metadata',
            nft_name: metadata.name
          }
        },
        pinataOptions: {
          cidVersion: 1, // Use CIDv1 for better compatibility
        }
      };

      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.IpfsHash) {
        throw new Error('Invalid response: missing IpfsHash');
      }

      console.log(`✅ Metadata uploaded to IPFS: ${result.IpfsHash}`);
      return result.IpfsHash;

    } catch (error) {
      console.error('Error uploading metadata to IPFS:', error);
      // Fallback to mock upload
      return this.mockMetadataUpload(metadata);
    }
  }

  private mockImageUpload(): Promise<string> {
    return new Promise((resolve) => {
      // Generate a mock IPFS hash for demo purposes
      const mockHash = `QmImage${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      
      // Simulate upload delay
      setTimeout(() => {
        resolve(mockHash);
      }, 1500 + Math.random() * 1000);
    });
  }

  private mockMetadataUpload(metadata: NFTMetadata): Promise<string> {
    return new Promise((resolve) => {
      // Generate a mock IPFS hash for demo purposes
      const mockHash = `QmMetadata${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      
      // Store metadata in localStorage for demo purposes
      const storageKey = `nft-metadata-${mockHash}`;
      localStorage.setItem(storageKey, JSON.stringify(metadata));
      
      // Simulate upload delay
      setTimeout(() => {
        resolve(mockHash);
      }, 1000 + Math.random() * 500);
    });
  }

  getImageUrl(hash: string): string {
    return `${this.gateway}${hash}`;
  }

  getMetadataUrl(hash: string): string {
    return `${this.gateway}${hash}`;
  }

  async fetchMetadata(hash: string): Promise<NFTMetadata | null> {
    try {
      // First try to fetch from localStorage (for demo metadata)
      const localStorageKey = `nft-metadata-${hash}`;
      const localData = localStorage.getItem(localStorageKey);
      
      if (localData) {
        return JSON.parse(localData);
      }

      // Then try to fetch from IPFS
      const response = await fetch(this.getMetadataUrl(hash));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return null;
    }
  }

  async fetchImageFromIPFS(hash: string): Promise<string> {
    try {
      return `${this.gateway}${hash}`;
    } catch (error) {
      console.error('Error fetching image from IPFS:', error);
      return '/placeholder-image.png';
    }
  }

  // Get all pinned files from user account for real-time display
  async getUserPinnedFiles(): Promise<Array<{
    ipfs_pin_hash: string;
    date_pinned: string;
    size: number;
    metadata?: {
      name?: string;
      keyvalues?: Record<string, unknown>;
    };
  }>> {
    try {
      const response = await axios.get('https://api.pinata.cloud/data/pinList', {
        headers: this.getAuthHeaders(),
        params: {
          status: 'pinned',
          pageLimit: 100
        }
      });
      return response.data.rows || [];
    } catch (error) {
      console.error('Error fetching user pinned files:', error);
      return [];
    }
  }

  // Enhanced metadata upload with better tracking
  async uploadNFTMetadata(metadata: NFTMetadata, nftId?: string): Promise<string> {
    try {
      const fileName = `MetaLease-NFT-${nftId || Date.now()}.json`;
      
      const metadataWithId = {
        ...metadata,
        created_at: new Date().toISOString(),
        platform: 'MetaLease',
        version: '1.0'
      };

      const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        pinataContent: metadataWithId,
        pinataMetadata: {
          name: fileName,
          keyvalues: {
            type: 'nft-metadata',
            platform: 'MetaLease',
            created: new Date().toISOString()
          }
        }
      }, {
        headers: this.getAuthHeaders()
      });

      console.log(`✅ NFT Metadata uploaded: ${response.data.IpfsHash}`);
      return response.data.IpfsHash;
    } catch (error) {
      console.error('Error uploading NFT metadata:', error);
      throw error;
    }
  }

  // Fetch all MetaLease NFTs from Pinata for marketplace display
  async getMetaLeaseNFTs(): Promise<Array<{
    ipfsHash: string;
    metadata: NFTMetadata | null;
    pinDate: string;
    size: number;
  }>> {
    try {
      const response = await axios.get('https://api.pinata.cloud/data/pinList', {
        headers: this.getAuthHeaders(),
        params: {
          status: 'pinned',
          pageLimit: 100,
          metadata: JSON.stringify({
            keyvalues: {
              platform: {
                value: 'MetaLease',
                op: 'eq'
              }
            }
          })
        }
      });
      
      // Fetch metadata for each file
      const metadataPromises = response.data.rows.map(async (file: {
        ipfs_pin_hash: string;
        date_pinned: string;
        size: number;
      }) => {
        try {
          const metadata = await this.fetchMetadataFromIPFS(file.ipfs_pin_hash);
          return {
            ipfsHash: file.ipfs_pin_hash,
            metadata: metadata,
            pinDate: file.date_pinned,
            size: file.size
          };
        } catch (error) {
          console.error(`Error fetching metadata for ${file.ipfs_pin_hash}:`, error);
          return null;
        }
      });
      
      const results = await Promise.all(metadataPromises);
      return results.filter(result => result !== null);
    } catch (error) {
      console.error('Error fetching MetaLease NFTs:', error);
      return [];
    }
  }
}

// Export singleton instance
export const ipfsService = new IPFSService();

// Export types for use in components
export type { NFTMetadata };