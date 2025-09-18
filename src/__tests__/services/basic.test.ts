/**
 * Basic IPFS Service Test
 * Simple test to verify Jest setup is working correctly
 */

describe('IPFS Service Setup', () => {
  test('should be able to run basic test', () => {
    expect(true).toBe(true)
  })

  test('should have environment variables available', () => {
    expect(process.env.NEXT_PUBLIC_PINATA_API_KEY).toBe('test_api_key')
    expect(process.env.NEXT_PUBLIC_PINATA_SECRET_KEY).toBe('test_secret_key')
  })
})