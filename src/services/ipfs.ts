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
  private pinataApiKey: string;
  private pinataSecretKey: string;
  private gateway: string;

  constructor() {
    this.pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY || process.env.PINATA_API_KEY || '';
    this.pinataSecretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || process.env.PINATA_SECRET_KEY || '';
    this.gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';
  }

  async uploadImageToIPFS(file: File): Promise<string> {
    try {
      // For development/demo purposes, we'll use a mock upload
      // In production, you would integrate with Pinata, Web3.Storage, or similar
      
      if (!this.pinataApiKey || !this.pinataSecretKey) {
        console.warn('IPFS credentials not configured, using mock upload');
        return this.mockImageUpload(file);
      }

      const formData = new FormData();
      formData.append('file', file);

      const pinataMetadata = JSON.stringify({
        name: `NFT-Image-${Date.now()}`,
        keyvalues: {
          type: 'nft-image'
        }
      });
      formData.append('pinataMetadata', pinataMetadata);

      const pinataOptions = JSON.stringify({
        cidVersion: 0,
      });
      formData.append('pinataOptions', pinataOptions);

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretKey,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.IpfsHash;

    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      // Fallback to mock upload
      return this.mockImageUpload(file);
    }
  }

  async uploadMetadataToIPFS(metadata: NFTMetadata): Promise<string> {
    try {
      if (!this.pinataApiKey || !this.pinataSecretKey) {
        console.warn('IPFS credentials not configured, using mock upload');
        return this.mockMetadataUpload(metadata);
      }

      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretKey,
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: `NFT-Metadata-${Date.now()}`,
            keyvalues: {
              type: 'nft-metadata'
            }
          },
          pinataOptions: {
            cidVersion: 0,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.IpfsHash;

    } catch (error) {
      console.error('Error uploading metadata to IPFS:', error);
      // Fallback to mock upload
      return this.mockMetadataUpload(metadata);
    }
  }

  private mockImageUpload(_file: File): Promise<string> {
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
}

// Export singleton instance
export const ipfsService = new IPFSService();

// Export types for use in components
export type { NFTMetadata };