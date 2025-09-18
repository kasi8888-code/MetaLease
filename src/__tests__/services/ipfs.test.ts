/**
 * IPFS Service Tests
 * 
 * Tests for Pinata IPFS connection, upload functionality, and hash retrieval
 * Covers both real Pinata API calls and mock fallback functionality
 */

import { ipfsService, NFTMetadata } from '../../services/ipfs'
import {
  mockNFTMetadata,
  mockPinataImageResponse,
  mockPinataMetadataResponse,
  createMockFile,
  MOCK_IMAGE_HASH_PATTERN,
  MOCK_METADATA_HASH_PATTERN,
  PINATA_FILE_UPLOAD_URL,
  PINATA_JSON_UPLOAD_URL
} from '../fixtures/mockData'

// Mock fetch for API testing
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('IPFS Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('Constructor and Configuration', () => {
    test('should initialize with environment variables', () => {
      expect(process.env.NEXT_PUBLIC_PINATA_API_KEY).toBe('test_api_key')
      expect(process.env.NEXT_PUBLIC_PINATA_SECRET_KEY).toBe('test_secret_key')
      expect(process.env.NEXT_PUBLIC_IPFS_GATEWAY).toBe('https://gateway.pinata.cloud/ipfs/')
    })

    test('should construct gateway URLs correctly', () => {
      const testHash = 'QmTestHash123'
      const imageUrl = ipfsService.getImageUrl(testHash)
      const metadataUrl = ipfsService.getMetadataUrl(testHash)

      expect(imageUrl).toBe('https://gateway.pinata.cloud/ipfs/QmTestHash123')
      expect(metadataUrl).toBe('https://gateway.pinata.cloud/ipfs/QmTestHash123')
    })
  })

  describe('Pinata Connection Tests', () => {
    test('should successfully authenticate with Pinata API for image upload', async () => {
      const mockFile = createMockFile('test.jpg', 1024, 'image/jpeg')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPinataImageResponse,
        status: 200,
      } as Response)

      const hash = await ipfsService.uploadImageToIPFS(mockFile)

      expect(mockFetch).toHaveBeenCalledWith(PINATA_FILE_UPLOAD_URL, {
        method: 'POST',
        headers: {
          'pinata_api_key': 'test_api_key',
          'pinata_secret_api_key': 'test_secret_key',
        },
        body: expect.any(FormData),
      })

      expect(hash).toBe(mockPinataImageResponse.IpfsHash)
    })

    test('should successfully authenticate with Pinata API for metadata upload', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPinataMetadataResponse,
        status: 200,
      } as Response)

      const hash = await ipfsService.uploadMetadataToIPFS(mockNFTMetadata)

      expect(mockFetch).toHaveBeenCalledWith(PINATA_JSON_UPLOAD_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': 'test_api_key',
          'pinata_secret_api_key': 'test_secret_key',
        },
        body: expect.stringContaining(mockNFTMetadata.name),
      })

      expect(hash).toBe(mockPinataMetadataResponse.IpfsHash)
    })

    test('should handle Pinata API authentication errors', async () => {
      const mockFile = createMockFile()

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const hash = await ipfsService.uploadImageToIPFS(mockFile)

      expect(consoleSpy).toHaveBeenCalledWith('Error uploading to IPFS:', expect.any(Error))
      expect(hash).toMatch(MOCK_IMAGE_HASH_PATTERN)

      consoleSpy.mockRestore()
    })

    test('should handle network errors gracefully', async () => {
      const mockFile = createMockFile()

      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const hash = await ipfsService.uploadImageToIPFS(mockFile)

      expect(consoleSpy).toHaveBeenCalled()
      expect(hash).toMatch(MOCK_IMAGE_HASH_PATTERN)

      consoleSpy.mockRestore()
    })
  })

  describe('File Upload Tests', () => {
    test('should upload image file with correct FormData structure', async () => {
      const mockFile = createMockFile('nft-image.png', 2048, 'image/png')
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPinataImageResponse,
      } as Response)

      await ipfsService.uploadImageToIPFS(mockFile)

      const [url, options] = mockFetch.mock.calls[0]
      expect(url).toBe(PINATA_FILE_UPLOAD_URL)
      expect(options?.method).toBe('POST')
      expect(options?.body).toBeInstanceOf(FormData)
      
      const formData = options?.body as FormData
      expect(formData.has('file')).toBe(true)
      expect(formData.has('pinataMetadata')).toBe(true)
      expect(formData.has('pinataOptions')).toBe(true)
    })

    test('should upload different image file types', async () => {
      const fileTypes = [
        { name: 'test.jpg', type: 'image/jpeg' },
        { name: 'test.png', type: 'image/png' },
        { name: 'test.gif', type: 'image/gif' },
        { name: 'test.webp', type: 'image/webp' }
      ]

      for (const fileType of fileTypes) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ IpfsHash: `QmTest${fileType.name}Hash` }),
        } as Response)

        const mockFile = createMockFile(fileType.name, 1024, fileType.type)
        const hash = await ipfsService.uploadImageToIPFS(mockFile)

        expect(hash).toBe(`QmTest${fileType.name}Hash`)
      }
    })

    test('should handle large file uploads', async () => {
      const largeFile = createMockFile('large-image.jpg', 10 * 1024 * 1024, 'image/jpeg') // 10MB

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPinataImageResponse,
      } as Response)

      const hash = await ipfsService.uploadImageToIPFS(largeFile)
      expect(hash).toBe(mockPinataImageResponse.IpfsHash)
    })

    test('should upload JSON metadata with correct structure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPinataMetadataResponse,
      } as Response)

      await ipfsService.uploadMetadataToIPFS(mockNFTMetadata)

      const [url, options] = mockFetch.mock.calls[0]
      const requestBody = JSON.parse(options?.body as string)

      expect(requestBody.pinataContent).toEqual(mockNFTMetadata)
      expect(requestBody.pinataMetadata.name).toContain('NFT-Metadata-')
      expect(requestBody.pinataMetadata.keyvalues.type).toBe('nft-metadata')
      expect(requestBody.pinataOptions.cidVersion).toBe(0)
    })

    test('should validate required metadata fields', async () => {
      const incompleteMetadata = {
        name: 'Test NFT',
        description: '',  // Empty description
        image: '',        // Empty image
        attributes: []
      } as NFTMetadata

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPinataMetadataResponse,
      } as Response)

      const hash = await ipfsService.uploadMetadataToIPFS(incompleteMetadata)
      expect(hash).toBe(mockPinataMetadataResponse.IpfsHash)

      const [, options] = mockFetch.mock.calls[0]
      const requestBody = JSON.parse(options?.body as string)
      expect(requestBody.pinataContent).toEqual(incompleteMetadata)
    })
  })

  describe('Hash Generation and Retrieval Tests', () => {
    test('should generate valid IPFS-like hash for mock image upload', async () => {
      // Test with missing credentials to trigger mock upload
      const originalApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY
      const originalSecretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY

      delete process.env.NEXT_PUBLIC_PINATA_API_KEY
      delete process.env.NEXT_PUBLIC_PINATA_SECRET_KEY

      const mockFile = createMockFile()
      const hash = await ipfsService.uploadImageToIPFS(mockFile)

      expect(hash).toMatch(MOCK_IMAGE_HASH_PATTERN)
      expect(hash).toHaveLength(55) // Expected length for mock hash

      // Restore environment variables
      process.env.NEXT_PUBLIC_PINATA_API_KEY = originalApiKey
      process.env.NEXT_PUBLIC_PINATA_SECRET_KEY = originalSecretKey
    })

    test('should generate valid IPFS-like hash for mock metadata upload', async () => {
      // Test with missing credentials to trigger mock upload
      const originalApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY
      const originalSecretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY

      delete process.env.NEXT_PUBLIC_PINATA_API_KEY
      delete process.env.NEXT_PUBLIC_PINATA_SECRET_KEY

      const hash = await ipfsService.uploadMetadataToIPFS(mockNFTMetadata)

      expect(hash).toMatch(MOCK_METADATA_HASH_PATTERN)
      expect(localStorage.setItem).toHaveBeenCalledWith(
        `nft-metadata-${hash}`,
        JSON.stringify(mockNFTMetadata)
      )

      // Restore environment variables
      process.env.NEXT_PUBLIC_PINATA_API_KEY = originalApiKey
      process.env.NEXT_PUBLIC_PINATA_SECRET_KEY = originalSecretKey
    })

    test('should retrieve metadata from localStorage for mock hashes', async () => {
      const mockHash = 'QmMetadata1234567890abcdef'
      const storageKey = `nft-metadata-${mockHash}`

      // Mock localStorage to return our test data
      ;(localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockNFTMetadata))

      const metadata = await ipfsService.fetchMetadata(mockHash)

      expect(localStorage.getItem).toHaveBeenCalledWith(storageKey)
      expect(metadata).toEqual(mockNFTMetadata)
    })

    test('should retrieve metadata from IPFS gateway when not in localStorage', async () => {
      const realHash = 'QmRealIPFSHashFromPinata123456789'

      // Mock localStorage to return null (not found)
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)

      // Mock fetch to return metadata from IPFS
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockNFTMetadata,
      } as Response)

      const metadata = await ipfsService.fetchMetadata(realHash)

      expect(mockFetch).toHaveBeenCalledWith(`https://gateway.pinata.cloud/ipfs/${realHash}`)
      expect(metadata).toEqual(mockNFTMetadata)
    })

    test('should handle failed metadata retrieval gracefully', async () => {
      const invalidHash = 'QmInvalidHash123'

      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const metadata = await ipfsService.fetchMetadata(invalidHash)

      expect(metadata).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('Error Handling and Fallback Tests', () => {
    test('should fall back to mock upload when credentials are missing', async () => {
      // Temporarily remove credentials
      const originalApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY
      const originalSecretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY

      delete process.env.NEXT_PUBLIC_PINATA_API_KEY
      delete process.env.NEXT_PUBLIC_PINATA_SECRET_KEY

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      const mockFile = createMockFile()

      const hash = await ipfsService.uploadImageToIPFS(mockFile)

      expect(consoleSpy).toHaveBeenCalledWith('IPFS credentials not configured, using mock upload')
      expect(hash).toMatch(MOCK_IMAGE_HASH_PATTERN)

      // Restore environment variables
      process.env.NEXT_PUBLIC_PINATA_API_KEY = originalApiKey
      process.env.NEXT_PUBLIC_PINATA_SECRET_KEY = originalSecretKey

      consoleSpy.mockRestore()
    })

    test('should handle API rate limiting errors', async () => {
      const mockFile = createMockFile()

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      } as Response)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const hash = await ipfsService.uploadImageToIPFS(mockFile)

      expect(hash).toMatch(MOCK_IMAGE_HASH_PATTERN)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    test('should handle malformed API responses', async () => {
      const mockFile = createMockFile()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalidResponse: 'missing IpfsHash' }),
      } as Response)

      const hash = await ipfsService.uploadImageToIPFS(mockFile)

      // Should fall back to mock upload
      expect(hash).toMatch(MOCK_IMAGE_HASH_PATTERN)
    })

    test('should handle timeout scenarios', async () => {
      const mockFile = createMockFile()

      // Mock a delayed response
      mockFetch.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: false,
            status: 408,
            statusText: 'Request Timeout',
          } as Response), 5000)
        )
      )

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const startTime = Date.now()
      const hash = await ipfsService.uploadImageToIPFS(mockFile)
      const endTime = Date.now()

      // Should complete reasonably quickly using mock fallback
      expect(endTime - startTime).toBeLessThan(7000)
      expect(hash).toMatch(MOCK_IMAGE_HASH_PATTERN)

      consoleSpy.mockRestore()
    })
  })

  describe('Mock Upload Simulation Tests', () => {
    test('should simulate realistic upload delays for images', async () => {
      // Remove credentials to trigger mock upload
      const originalApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY
      delete process.env.NEXT_PUBLIC_PINATA_API_KEY

      const mockFile = createMockFile()
      const startTime = Date.now()

      const hash = await ipfsService.uploadImageToIPFS(mockFile)
      
      const endTime = Date.now()
      const uploadTime = endTime - startTime

      // Mock upload should take between 1.5-2.5 seconds
      expect(uploadTime).toBeGreaterThanOrEqual(1400)
      expect(uploadTime).toBeLessThanOrEqual(3000)
      expect(hash).toMatch(MOCK_IMAGE_HASH_PATTERN)

      // Restore environment variable
      process.env.NEXT_PUBLIC_PINATA_API_KEY = originalApiKey
    })

    test('should simulate realistic upload delays for metadata', async () => {
      // Remove credentials to trigger mock upload
      const originalSecretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY
      delete process.env.NEXT_PUBLIC_PINATA_SECRET_KEY

      const startTime = Date.now()

      const hash = await ipfsService.uploadMetadataToIPFS(mockNFTMetadata)
      
      const endTime = Date.now()
      const uploadTime = endTime - startTime

      // Mock metadata upload should take between 1-1.5 seconds
      expect(uploadTime).toBeGreaterThanOrEqual(900)
      expect(uploadTime).toBeLessThanOrEqual(2000)
      expect(hash).toMatch(MOCK_METADATA_HASH_PATTERN)

      // Restore environment variable
      process.env.NEXT_PUBLIC_PINATA_SECRET_KEY = originalSecretKey
    })

    test('should generate unique hashes for multiple uploads', async () => {
      // Remove credentials to trigger mock uploads
      const originalApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY
      delete process.env.NEXT_PUBLIC_PINATA_API_KEY

      const hashes = []
      for (let i = 0; i < 5; i++) {
        const mockFile = createMockFile(`test-${i}.jpg`)
        const hash = await ipfsService.uploadImageToIPFS(mockFile)
        hashes.push(hash)
      }

      // All hashes should be unique
      const uniqueHashes = new Set(hashes)
      expect(uniqueHashes.size).toBe(hashes.length)

      // All should match the pattern
      hashes.forEach(hash => {
        expect(hash).toMatch(MOCK_IMAGE_HASH_PATTERN)
      })

      // Restore environment variable
      process.env.NEXT_PUBLIC_PINATA_API_KEY = originalApiKey
    })
  })
})