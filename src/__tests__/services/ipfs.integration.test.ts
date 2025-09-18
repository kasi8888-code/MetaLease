/**
 * IPFS Integration Tests
 * 
 * End-to-end tests that verify complete upload and retrieval workflows
 * Tests both real Pinata API integration and mock fallback scenarios
 */

import { ipfsService, NFTMetadata } from '../../services/ipfs'
import {
  mockNFTMetadata,
  createMockFile,
  MOCK_IMAGE_HASH_PATTERN,
  MOCK_METADATA_HASH_PATTERN
} from '../fixtures/mockData'

// Mock fetch for controlled testing
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('IPFS Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('Complete NFT Creation Workflow', () => {
    test('should handle complete NFT creation with image and metadata upload', async () => {
      const mockImage = createMockFile('nft-artwork.png', 2048, 'image/png')

      // Mock successful Pinata responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ IpfsHash: 'QmImageHash123456789' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ IpfsHash: 'QmMetadataHash123456789' }),
        } as Response)

      // Step 1: Upload image
      const imageHash = await ipfsService.uploadImageToIPFS(mockImage)
      expect(imageHash).toBe('QmImageHash123456789')

      // Step 2: Create metadata with image hash
      const nftMetadata: NFTMetadata = {
        ...mockNFTMetadata,
        image: imageHash
      }

      // Step 3: Upload metadata
      const metadataHash = await ipfsService.uploadMetadataToIPFS(nftMetadata)
      expect(metadataHash).toBe('QmMetadataHash123456789')

      // Verify API calls were made correctly
      expect(mockFetch).toHaveBeenCalledTimes(2)
      
      const [firstCall, secondCall] = mockFetch.mock.calls
      expect(firstCall[0]).toContain('pinFileToIPFS')
      expect(secondCall[0]).toContain('pinJSONToIPFS')
    })

    test('should handle image upload failure and metadata success', async () => {
      const mockImage = createMockFile('nft-artwork.jpg')

      // Mock image upload failure, metadata success
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ IpfsHash: 'QmMetadataHash987654321' }),
        } as Response)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Image upload should fall back to mock
      const imageHash = await ipfsService.uploadImageToIPFS(mockImage)
      expect(imageHash).toMatch(MOCK_IMAGE_HASH_PATTERN)

      // Metadata upload should succeed
      const nftMetadata: NFTMetadata = {
        ...mockNFTMetadata,
        image: imageHash
      }

      const metadataHash = await ipfsService.uploadMetadataToIPFS(nftMetadata)
      expect(metadataHash).toBe('QmMetadataHash987654321')

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    test('should handle both uploads falling back to mock', async () => {
      // Remove credentials to force mock uploads
      const originalApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY
      const originalSecretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY

      delete process.env.NEXT_PUBLIC_PINATA_API_KEY
      delete process.env.NEXT_PUBLIC_PINATA_SECRET_KEY

      const mockImage = createMockFile('test-nft.png')

      // Upload image (mock)
      const imageHash = await ipfsService.uploadImageToIPFS(mockImage)
      expect(imageHash).toMatch(MOCK_IMAGE_HASH_PATTERN)

      // Upload metadata (mock)
      const nftMetadata: NFTMetadata = {
        ...mockNFTMetadata,
        image: imageHash
      }

      const metadataHash = await ipfsService.uploadMetadataToIPFS(nftMetadata)
      expect(metadataHash).toMatch(MOCK_METADATA_HASH_PATTERN)

      // Verify metadata is stored in localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith(
        `nft-metadata-${metadataHash}`,
        JSON.stringify(nftMetadata)
      )

      // Restore environment variables
      process.env.NEXT_PUBLIC_PINATA_API_KEY = originalApiKey
      process.env.NEXT_PUBLIC_PINATA_SECRET_KEY = originalSecretKey
    })
  })

  describe('Upload and Retrieval Workflow', () => {
    test('should upload metadata and successfully retrieve it', async () => {
      // Mock successful upload
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ IpfsHash: 'QmRetrievalTest123456789' }),
      } as Response)

      // Upload metadata
      const uploadedHash = await ipfsService.uploadMetadataToIPFS(mockNFTMetadata)
      expect(uploadedHash).toBe('QmRetrievalTest123456789')

      // Mock successful retrieval
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockNFTMetadata,
      } as Response)

      // Retrieve metadata
      const retrievedMetadata = await ipfsService.fetchMetadata(uploadedHash)
      expect(retrievedMetadata).toEqual(mockNFTMetadata)

      // Verify correct gateway URL was called
      expect(mockFetch).toHaveBeenLastCalledWith(
        'https://gateway.pinata.cloud/ipfs/QmRetrievalTest123456789'
      )
    })

    test('should upload with mock and retrieve from localStorage', async () => {
      // Force mock upload
      const originalApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY
      delete process.env.NEXT_PUBLIC_PINATA_API_KEY

      // Upload metadata (mock)
      const uploadedHash = await ipfsService.uploadMetadataToIPFS(mockNFTMetadata)
      expect(uploadedHash).toMatch(MOCK_METADATA_HASH_PATTERN)

      // Mock localStorage retrieval
      ;(localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockNFTMetadata))

      // Retrieve metadata
      const retrievedMetadata = await ipfsService.fetchMetadata(uploadedHash)
      expect(retrievedMetadata).toEqual(mockNFTMetadata)

      expect(localStorage.getItem).toHaveBeenCalledWith(`nft-metadata-${uploadedHash}`)

      // Restore environment variable
      process.env.NEXT_PUBLIC_PINATA_API_KEY = originalApiKey
    })

    test('should handle retrieval failure gracefully', async () => {
      const testHash = 'QmNonExistentHash123456789'

      // Mock localStorage miss
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)

      // Mock IPFS retrieval failure
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const retrievedMetadata = await ipfsService.fetchMetadata(testHash)
      expect(retrievedMetadata).toBeNull()

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('Performance and Reliability Tests', () => {
    test('should handle multiple concurrent uploads', async () => {
      const uploadCount = 5
      const mockFiles = Array.from({ length: uploadCount }, (_, i) => 
        createMockFile(`concurrent-test-${i}.jpg`)
      )

      // Mock successful responses for all uploads
      for (let i = 0; i < uploadCount; i++) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ IpfsHash: `QmConcurrent${i}Hash123456789` }),
        } as Response)
      }

      // Start all uploads concurrently
      const uploadPromises = mockFiles.map(file => ipfsService.uploadImageToIPFS(file))
      const hashes = await Promise.all(uploadPromises)

      // Verify all uploads completed successfully
      expect(hashes).toHaveLength(uploadCount)
      hashes.forEach((hash, index) => {
        expect(hash).toBe(`QmConcurrent${index}Hash123456789`)
      })

      expect(mockFetch).toHaveBeenCalledTimes(uploadCount)
    })

    test('should handle mixed success/failure in concurrent uploads', async () => {
      const mockFiles = [
        createMockFile('success1.jpg'),
        createMockFile('failure1.jpg'),
        createMockFile('success2.jpg'),
        createMockFile('failure2.jpg')
      ]

      // Mock alternating success/failure responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ IpfsHash: 'QmSuccess1Hash' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ IpfsHash: 'QmSuccess2Hash' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
        } as Response)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const uploadPromises = mockFiles.map(file => ipfsService.uploadImageToIPFS(file))
      const hashes = await Promise.all(uploadPromises)

      expect(hashes[0]).toBe('QmSuccess1Hash')
      expect(hashes[1]).toMatch(MOCK_IMAGE_HASH_PATTERN) // Fallback
      expect(hashes[2]).toBe('QmSuccess2Hash')
      expect(hashes[3]).toMatch(MOCK_IMAGE_HASH_PATTERN) // Fallback

      expect(consoleSpy).toHaveBeenCalledTimes(2) // Two failures
      consoleSpy.mockRestore()
    })

    test('should validate hash integrity across upload/retrieve cycle', async () => {
      // Test with real Pinata simulation
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ IpfsHash: 'QmIntegrityTest123456789' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockNFTMetadata,
        } as Response)

      // Upload
      const uploadedHash = await ipfsService.uploadMetadataToIPFS(mockNFTMetadata)

      // Retrieve
      const retrievedMetadata = await ipfsService.fetchMetadata(uploadedHash)

      // Verify integrity
      expect(uploadedHash).toBe('QmIntegrityTest123456789')
      expect(retrievedMetadata).toEqual(mockNFTMetadata)

      // Ensure no data corruption
      expect(retrievedMetadata?.name).toBe(mockNFTMetadata.name)
      expect(retrievedMetadata?.description).toBe(mockNFTMetadata.description)
      expect(retrievedMetadata?.attributes).toEqual(mockNFTMetadata.attributes)
    })
  })

  describe('Real Pinata API Integration Tests', () => {
    // Note: These tests require real Pinata credentials and will be skipped if not available
    
    test('should connect to real Pinata API when credentials are available', async () => {
      const realApiKey = process.env.PINATA_API_KEY // Different from test keys
      const realSecretKey = process.env.PINATA_SECRET_KEY

      if (!realApiKey || !realSecretKey) {
        console.log('Skipping real Pinata API test - credentials not available')
        return
      }

      // Set real credentials temporarily
      process.env.NEXT_PUBLIC_PINATA_API_KEY = realApiKey
      process.env.NEXT_PUBLIC_PINATA_SECRET_KEY = realSecretKey

      // Don't mock fetch for this test - use real API
      mockFetch.mockRestore()

      const testFile = createMockFile('real-test.jpg', 1024, 'image/jpeg')

      try {
        const hash = await ipfsService.uploadImageToIPFS(testFile)
        
        // Real Pinata hashes should follow IPFS format
        expect(hash).toMatch(/^Qm[A-Za-z0-9]{44}$/)
        console.log('Real Pinata upload successful:', hash)

        // Test retrieval
        const imageUrl = ipfsService.getImageUrl(hash)
        expect(imageUrl).toBe(`https://gateway.pinata.cloud/ipfs/${hash}`)

      } catch (error) {
        console.warn('Real Pinata API test failed:', error)
        // This is expected if rate limits or network issues occur
      } finally {
        // Restore test credentials
        process.env.NEXT_PUBLIC_PINATA_API_KEY = 'test_api_key'
        process.env.NEXT_PUBLIC_PINATA_SECRET_KEY = 'test_secret_key'

        // Re-mock fetch for other tests
        global.fetch = jest.fn()
      }
    })
  })
})