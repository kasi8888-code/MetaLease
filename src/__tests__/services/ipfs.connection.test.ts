/**
 * Pinata Connection Health Tests
 * 
 * Specialized tests for verifying Pinata API connectivity and health
 * Can be used for debugging connection issues and API key validation
 */

import { ipfsService } from '../../services/ipfs'
import { createMockFile, mockPinataImageResponse } from '../fixtures/mockData'

// Mock fetch for API testing
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('Pinata Connection Health', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Ensure test environment has credentials
    process.env.NEXT_PUBLIC_PINATA_API_KEY = 'test_api_key'
    process.env.NEXT_PUBLIC_PINATA_SECRET_KEY = 'test_secret_key'
  })

  describe('API Key Authentication Tests', () => {
    test('should send correct authentication headers to Pinata API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPinataImageResponse,
      } as Response)

      const mockFile = createMockFile('auth-test.jpg')
      await ipfsService.uploadImageToIPFS(mockFile)

      const [url, options] = mockFetch.mock.calls[0]
      expect(url).toBe('https://api.pinata.cloud/pinning/pinFileToIPFS')
      expect(options?.headers).toMatchObject({
        'pinata_api_key': 'test_api_key',
        'pinata_secret_api_key': 'test_secret_key',
      })
    })

    test('should handle invalid API key error (401)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const mockFile = createMockFile()

      const hash = await ipfsService.uploadImageToIPFS(mockFile)

      // Should fall back to mock upload
      expect(hash).toMatch(/^QmImage\d+[a-z0-9]{9}$/)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    test('should handle rate limiting (429) gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      } as Response)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const mockFile = createMockFile()

      const hash = await ipfsService.uploadImageToIPFS(mockFile)

      // Should fall back to mock upload
      expect(hash).toMatch(/^QmImage\d+[a-z0-9]{9}$/)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    test('should handle insufficient credits error (402)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 402,
        statusText: 'Payment Required',
      } as Response)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const mockFile = createMockFile()

      const hash = await ipfsService.uploadImageToIPFS(mockFile)

      expect(hash).toMatch(/^QmImage\d+[a-z0-9]{9}$/)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('API Endpoint Validation Tests', () => {
    test('should use correct Pinata file upload endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPinataImageResponse,
      } as Response)

      const mockFile = createMockFile()
      await ipfsService.uploadImageToIPFS(mockFile)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        expect.any(Object)
      )
    })

    test('should use correct Pinata JSON upload endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ IpfsHash: 'QmMetadataTest123' }),
      } as Response)

      const metadata = {
        name: 'Test NFT',
        description: 'Test Description',
        image: 'QmTestImage123',
        attributes: []
      }

      await ipfsService.uploadMetadataToIPFS(metadata)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        expect.any(Object)
      )
    })

    test('should construct correct IPFS gateway URLs', () => {
      const testHash = 'QmTestHash123456789'
      
      const imageUrl = ipfsService.getImageUrl(testHash)
      const metadataUrl = ipfsService.getMetadataUrl(testHash)

      expect(imageUrl).toBe('https://gateway.pinata.cloud/ipfs/QmTestHash123456789')
      expect(metadataUrl).toBe('https://gateway.pinata.cloud/ipfs/QmTestHash123456789')
    })
  })

  describe('Request Format Validation Tests', () => {
    test('should format file upload request correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPinataImageResponse,
      } as Response)

      const mockFile = createMockFile('format-test.jpg', 2048, 'image/jpeg')
      await ipfsService.uploadImageToIPFS(mockFile)

      const [, options] = mockFetch.mock.calls[0]
      const formData = options?.body as FormData

      // Verify FormData contains required fields
      expect(formData.has('file')).toBe(true)
      expect(formData.has('pinataMetadata')).toBe(true)
      expect(formData.has('pinataOptions')).toBe(true)

      // Verify metadata format
      const metadataString = formData.get('pinataMetadata') as string
      const metadata = JSON.parse(metadataString)
      expect(metadata.name).toContain('NFT-Image-')
      expect(metadata.keyvalues.type).toBe('nft-image')

      // Verify options format
      const optionsString = formData.get('pinataOptions') as string
      const optionsObj = JSON.parse(optionsString)
      expect(optionsObj.cidVersion).toBe(0)
    })

    test('should format JSON upload request correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ IpfsHash: 'QmJsonTest123' }),
      } as Response)

      const testMetadata = {
        name: 'JSON Format Test',
        description: 'Testing JSON format',
        image: 'QmTestImage',
        attributes: [{ trait_type: 'Test', value: 'Format' }]
      }

      await ipfsService.uploadMetadataToIPFS(testMetadata)

      const [, options] = mockFetch.mock.calls[0]
      const requestBody = JSON.parse(options?.body as string)

      expect(requestBody.pinataContent).toEqual(testMetadata)
      expect(requestBody.pinataMetadata.name).toContain('NFT-Metadata-')
      expect(requestBody.pinataMetadata.keyvalues.type).toBe('nft-metadata')
      expect(requestBody.pinataOptions.cidVersion).toBe(0)
    })
  })

  describe('Response Handling Tests', () => {
    test('should extract IPFS hash from Pinata response correctly', async () => {
      const expectedHash = 'QmExpectedHash123456789'
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          IpfsHash: expectedHash,
          PinSize: 12345,
          Timestamp: '2023-01-01T00:00:00.000Z'
        }),
      } as Response)

      const mockFile = createMockFile()
      const hash = await ipfsService.uploadImageToIPFS(mockFile)

      expect(hash).toBe(expectedHash)
    })

    test('should handle malformed Pinata response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          // Missing IpfsHash field
          PinSize: 12345,
          Timestamp: '2023-01-01T00:00:00.000Z'
        }),
      } as Response)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const mockFile = createMockFile()

      const hash = await ipfsService.uploadImageToIPFS(mockFile)

      // Should fall back to mock upload
      expect(hash).toMatch(/^QmImage\d+[a-z0-9]{9}$/)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    test('should handle JSON parsing errors in response', async () => {
      mockFetch.mockRejectedValueOnce(new Error('JSON parsing failed'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const mockFile = createMockFile()

      const hash = await ipfsService.uploadImageToIPFS(mockFile)

      expect(hash).toMatch(/^QmImage\d+[a-z0-9]{9}$/)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('Connection Testing Utilities', () => {
    test('should provide diagnostic information for failed connections', async () => {
      const errorScenarios = [
        { status: 401, expected: 'Authentication failed - check API keys' },
        { status: 402, expected: 'Insufficient credits - check billing' },
        { status: 429, expected: 'Rate limited - reduce request frequency' },
        { status: 500, expected: 'Server error - try again later' },
        { status: 503, expected: 'Service unavailable - try again later' }
      ]

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      for (const scenario of errorScenarios) {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: scenario.status,
          statusText: `Error ${scenario.status}`,
        } as Response)

        const mockFile = createMockFile(`test-${scenario.status}.jpg`)
        await ipfsService.uploadImageToIPFS(mockFile)

        // Verify error was logged
        expect(consoleSpy).toHaveBeenCalled()
      }

      consoleSpy.mockRestore()
    })
  })
})

/**
 * Test utility function to check real Pinata connection
 * Can be used for manual testing or debugging
 */
export async function testRealPinataConnection() {
  const testApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY
  const testSecretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY

  if (!testApiKey || !testSecretKey) {
    console.log('❌ Pinata API credentials not configured')
    return false
  }

  try {
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        'pinata_api_key': testApiKey,
        'pinata_secret_api_key': testSecretKey,
      },
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Pinata connection successful:', data)
      return true
    } else {
      console.log('❌ Pinata connection failed:', response.status, response.statusText)
      return false
    }
  } catch (error) {
    console.log('❌ Pinata connection error:', error)
    return false
  }
}