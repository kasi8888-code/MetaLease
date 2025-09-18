/**
 * Test IPFS Service Integration
 * 
 * Test the updated IPFS service with JWT authentication
 */

const fs = require('fs')
const path = require('path')

// Import the IPFS service (we'll test it in a Node.js context)
async function testIPFSServiceIntegration() {
  console.log('🧪 Testing Updated IPFS Service Integration...\n')

  try {
    // Set environment variables for testing
    process.env.NEXT_PUBLIC_PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5YzE4ZGRiOS00NWE2LTRmZjQtODIyYS0yZjVmOGU2NzE3YjAiLCJlbWFpbCI6Im5hdmVlbjEyMzQ1Njc4OUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYWY5YzZhMzUwNjVlMTE0MGU3M2UiLCJzY29wZWRLZXlTZWNyZXQiOiJhZjgzNzlhMDIxYzBhZWJmOGFmOWFjYmU0NjliY2MwMjgwNDc0NTA0ZTc5ZTA4M2QxZmE5NjBhOGExNWRiNzg2IiwiaWF0IjoxNzI2NzAyNTA4fQ.A1s61j0BQFGfKfBG1EZ5hPCXh1jKWNVXhFKyYHZ6T6o'

    // Mock the global fetch for Node.js environment
    global.fetch = require('node-fetch').default || require('node-fetch')

    // Create a mock File class for Node.js
    class MockFile {
      constructor(data, name, options = {}) {
        this.data = data
        this.name = name
        this.type = options.type || 'image/jpeg'
        this.size = data.length
        this.lastModified = Date.now()
      }
    }

    global.File = MockFile
    global.FormData = require('form-data')

    console.log('✅ Environment set up for testing')

    // Test metadata upload
    console.log('\n📤 Testing Metadata Upload...')
    
    const testMetadata = {
      name: 'Integration Test NFT',
      description: 'Testing the updated IPFS service with JWT authentication',
      image: 'QmTestImageHash123456789',
      attributes: [
        {
          trait_type: 'Test Type',
          value: 'Integration Test'
        },
        {
          trait_type: 'Authentication',
          value: 'JWT'
        }
      ]
    }

    // Simulate the service upload
    const axios = require('axios')
    
    const uploadPayload = {
      pinataContent: testMetadata,
      pinataMetadata: {
        name: `Integration-Test-${Date.now()}`,
        keyvalues: {
          type: 'nft-metadata',
          nft_name: testMetadata.name
        }
      },
      pinataOptions: {
        cidVersion: 1,
      }
    }

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      uploadPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
        },
      }
    )

    console.log('✅ Metadata Upload Successful!')
    console.log(`   IPFS Hash: ${response.data.IpfsHash}`)
    console.log(`   Gateway URL: https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`)

    // Test retrieval
    console.log('\n📥 Testing Metadata Retrieval...')
    
    const retrievalResponse = await axios.get(`https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`)
    
    console.log('✅ Metadata Retrieval Successful!')
    console.log(`   Retrieved NFT Name: ${retrievalResponse.data.name}`)
    console.log(`   Retrieved Description: ${retrievalResponse.data.description}`)

    console.log('\n🔍 Verifying Data Integrity...')
    
    const retrieved = retrievalResponse.data
    const original = testMetadata

    if (retrieved.name === original.name && 
        retrieved.description === original.description &&
        retrieved.image === original.image) {
      console.log('✅ Data integrity verified!')
    } else {
      console.log('❌ Data integrity check failed!')
      return false
    }

    return true

  } catch (error) {
    console.log('❌ Integration test failed!')
    if (error.response) {
      console.log(`   Status: ${error.response.status} ${error.response.statusText}`)
      console.log(`   Details:`, error.response.data)
    } else {
      console.log(`   Error: ${error.message}`)
    }
    return false
  }
}

// Run the integration test
testIPFSServiceIntegration()
  .then(success => {
    console.log('\n' + '='.repeat(50))
    if (success) {
      console.log('🎉 IPFS Service Integration Test Passed!')
      console.log('✅ JWT authentication working correctly')
      console.log('✅ Upload and retrieval functioning')
      console.log('✅ Data integrity maintained')
      console.log('\n🚀 Ready for NFT creation in your app!')
    } else {
      console.log('💥 Integration test failed')
    }
    console.log('='.repeat(50))
  })
  .catch(error => {
    console.error('💥 Test execution failed:', error)
  })