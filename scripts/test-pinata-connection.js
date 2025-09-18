#!/usr/bin/env node

/**
 * Pinata Connection Test Runner
 * 
 * This script provides a command-line interface to test Pinata IPFS connectivity
 * and upload functionality with real API credentials.
 * 
 * Usage:
 *   node scripts/test-pinata-connection.js
 *   npm run test:pinata:live
 */

const { testRealPinataConnection } = require('../src/__tests__/services/ipfs.connection.test.ts')

async function runPinataTests() {
  console.log('🚀 Starting Pinata Connection Tests...\n')

  // Check environment variables
  console.log('📋 Environment Check:')
  console.log(`   NEXT_PUBLIC_PINATA_API_KEY: ${process.env.NEXT_PUBLIC_PINATA_API_KEY ? '✅ Set' : '❌ Missing'}`)
  console.log(`   NEXT_PUBLIC_PINATA_SECRET_KEY: ${process.env.NEXT_PUBLIC_PINATA_SECRET_KEY ? '✅ Set' : '❌ Missing'}`)
  console.log(`   NEXT_PUBLIC_IPFS_GATEWAY: ${process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'Using default'}`)
  console.log('')

  // Test basic connectivity
  console.log('🔌 Testing Pinata API Connection...')
  const connectionResult = await testRealPinataConnection()
  
  if (!connectionResult) {
    console.log('\n❌ Connection test failed. Please check:')
    console.log('   1. Your Pinata API credentials are correct')
    console.log('   2. Your internet connection is stable')
    console.log('   3. Pinata service is operational')
    console.log('   4. Your account has sufficient credits')
    process.exit(1)
  }

  console.log('\n✅ All Pinata connection tests passed!')
  console.log('🎉 Your IPFS setup is ready for NFT uploads!')
}

// Handle command line execution
if (require.main === module) {
  runPinataTests().catch(error => {
    console.error('\n💥 Test runner failed:', error)
    process.exit(1)
  })
}

module.exports = { runPinataTests }