import { NFTMetadata } from '../../services/ipfs'

// Mock NFT metadata for testing
export const mockNFTMetadata: NFTMetadata = {
  name: 'Test NFT',
  description: 'This is a test NFT for unit testing purposes',
  image: 'QmTestImageHash123',
  attributes: [
    {
      trait_type: 'Color',
      value: 'Blue'
    },
    {
      trait_type: 'Rarity',
      value: 'Common'
    },
    {
      trait_type: 'Type',
      value: 'Test'
    }
  ]
}

// Mock Pinata API responses
export const mockPinataImageResponse = {
  IpfsHash: 'QmTestImageHash123456789',
  PinSize: 1234567,
  Timestamp: '2023-01-01T00:00:00.000Z'
}

export const mockPinataMetadataResponse = {
  IpfsHash: 'QmTestMetadataHash123456789',
  PinSize: 987654,
  Timestamp: '2023-01-01T00:00:00.000Z'
}

// Create a mock File object for testing
export const createMockFile = (
  name: string = 'test-image.jpg',
  size: number = 1024,
  type: string = 'image/jpeg'
): File => {
  const content = new Array(size).fill(0).map(() => Math.floor(Math.random() * 256))
  const buffer = new ArrayBuffer(content.length)
  const view = new Uint8Array(buffer)
  view.set(content)
  
  const blob = new Blob([buffer], { type })
  return new File([blob], name, { type, lastModified: Date.now() })
}

// Mock IPFS hash patterns
export const MOCK_IPFS_HASH_PATTERN = /^Qm[A-Za-z0-9]{44}$/
export const MOCK_IMAGE_HASH_PATTERN = /^QmImage\d+[a-z0-9]{9}$/
export const MOCK_METADATA_HASH_PATTERN = /^QmMetadata\d+[a-z0-9]{9}$/

// Expected API endpoints
export const PINATA_FILE_UPLOAD_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS'
export const PINATA_JSON_UPLOAD_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS'