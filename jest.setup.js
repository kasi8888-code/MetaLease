import '@testing-library/jest-dom'

// Mock window.localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

global.localStorage = localStorageMock

// Mock fetch globally
global.fetch = jest.fn()

// Setup environment variables for testing
process.env.NEXT_PUBLIC_PINATA_API_KEY = 'test_api_key'
process.env.NEXT_PUBLIC_PINATA_SECRET_KEY = 'test_secret_key'
process.env.NEXT_PUBLIC_IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/'

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
})