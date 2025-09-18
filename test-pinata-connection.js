/**
 * Simple Pinata API Connection Test
 * 
 * Basic test to verify Pinata API connectivity and authentication
 */

const axios = require('axios')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config()
dotenv.config({ path: '.env.local' }) // Also load .env.local if it exists

// Test configuration
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || process.env.PINATA_API_KEY
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || process.env.PINATA_SECRET_KEY

console.log('🔧 Testing Pinata API Connection...\n')

async function testPinataConnection() {
  console.log('📋 Configuration Check:')
  console.log(`   API Key: ${PINATA_API_KEY ? '✅ Present' : '❌ Missing'}`)
  console.log(`   Secret Key: ${PINATA_SECRET_KEY ? '✅ Present' : '❌ Missing'}\n`)

  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    console.log('❌ Missing API credentials. Please check your environment variables.\n')
    return false
  }

  try {
    console.log('🌐 Testing API Connection...')
    
    // Test authentication endpoint
    const response = await axios.get('https://api.pinata.cloud/data/testAuthentication', {
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
    })

    console.log(`   Status: ${response.status} ${response.statusText}`)

    if (response.status === 200) {
      const data = response.data
      console.log('✅ Pinata API Connection Successful!')
      console.log(`   Message: ${data.message}`)
      
      // Test file upload capability
      console.log('\n📁 Testing File Upload Capability...')
      await testFileUpload()
      
      return true
    } else {
      console.log('❌ Pinata API Connection Failed!')
      console.log(`   Error: HTTP ${response.status}`)
      return false
    }
  } catch (error) {
    console.log('❌ Connection Error!')
    
    if (error.response) {
      // Server responded with error status
      console.log(`   Status: ${error.response.status} ${error.response.statusText}`)
      if (error.response.status === 401) {
        console.log('   Error: Invalid API credentials')
      } else if (error.response.status === 429) {
        console.log('   Error: Rate limit exceeded')
      } else if (error.response.status === 402) {
        console.log('   Error: Payment required - insufficient credits')
      }
    } else {
      console.log(`   Error: ${error.message}`)
    }
    return false
  }
}

async function testFileUpload() {
  try {
    // Create a simple test JSON object
    const testData = {
      name: 'Test NFT Connection',
      description: 'Testing Pinata connection',
      image: 'QmTestHash123',
      attributes: []
    }

    const payload = {
      pinataContent: testData,
      pinataMetadata: {
        name: `Test-Connection-${Date.now()}`,
        keyvalues: {
          type: 'test-connection'
        }
      },
      pinataOptions: {
        cidVersion: 0,
      }
    }

    const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', payload, {
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
    })

    if (response.status === 200) {
      const result = response.data
      console.log('✅ File Upload Test Successful!')
      console.log(`   IPFS Hash: ${result.IpfsHash}`)
      console.log(`   Pin Size: ${result.PinSize} bytes`)
      console.log(`   Gateway URL: https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`)
      
      // Test retrieval
      await testRetrieval(result.IpfsHash)
      
    } else {
      console.log('❌ File Upload Test Failed!')
      console.log(`   Status: ${response.status} ${response.statusText}`)
    }
    
  } catch (error) {
    console.log('❌ File Upload Error!')
    if (error.response) {
      console.log(`   Status: ${error.response.status} ${error.response.statusText}`)
    } else {
      console.log(`   Error: ${error.message}`)
    }
  }
}

async function testRetrieval(hash) {
  try {
    console.log('\n📥 Testing File Retrieval...')
    
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${hash}`)
    
    if (response.status === 200) {
      const data = response.data
      console.log('✅ File Retrieval Successful!')
      console.log(`   Retrieved: ${data.name}`)
    } else {
      console.log('❌ File Retrieval Failed!')
      console.log(`   Status: ${response.status}`)
    }
    
  } catch (error) {
    console.log('❌ Retrieval Error!')
    if (error.response) {
      console.log(`   Status: ${error.response.status} ${error.response.statusText}`)
    } else {
      console.log(`   Error: ${error.message}`)
    }
  }
}

// Run the test
testPinataConnection()
  .then(success => {
    console.log('\n' + '='.repeat(50))
    if (success) {
      console.log('🎉 All tests passed! Pinata is ready to use.')
    } else {
      console.log('💥 Tests failed. Please check your configuration.')
    }
    console.log('='.repeat(50))
  })
  .catch(error => {
    console.error('💥 Test execution failed:', error)
  })