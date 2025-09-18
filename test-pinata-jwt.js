/**
 * Pinata JWT Authentication Test
 * 
 * Tests Pinata API using JWT authentication (recommended method)
 */

const axios = require('axios')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config()
dotenv.config({ path: '.env.local' })

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || process.env.PINATA_JWT

console.log('🔐 Testing Pinata API with JWT Authentication...\n')

async function testJWTAuthentication() {
  console.log('📋 JWT Configuration Check:')
  console.log(`   JWT Token: ${PINATA_JWT ? '✅ Present' : '❌ Missing'}`)
  
  if (PINATA_JWT) {
    console.log(`   Token Length: ${PINATA_JWT.length} characters`)
    console.log(`   Token Preview: ${PINATA_JWT.substring(0, 50)}...`)
  }
  console.log()

  if (!PINATA_JWT) {
    console.log('❌ JWT token not found. Please check your environment variables.\n')
    console.log('To get a JWT token:')
    console.log('1. Go to https://pinata.cloud/')
    console.log('2. Navigate to API Keys in your dashboard')
    console.log('3. Create a new API key with required permissions')
    console.log('4. Copy the JWT token to your .env.local file as PINATA_JWT')
    return false
  }

  try {
    console.log('🌐 Testing JWT Authentication...')
    
    // Test authentication with JWT
    const authResponse = await axios.get('https://api.pinata.cloud/data/testAuthentication', {
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
    })

    console.log(`   Status: ${authResponse.status} ${authResponse.statusText}`)
    console.log('✅ JWT Authentication Successful!')
    console.log(`   Message: ${authResponse.data.message}`)

    // Test JSON upload with JWT
    console.log('\n📤 Testing JSON Upload with JWT...')
    
    const testMetadata = {
      name: 'JWT Test NFT',
      description: 'Testing Pinata JWT authentication',
      image: 'QmTestImageHash123',
      attributes: [
        {
          trait_type: 'Authentication Method',
          value: 'JWT'
        },
        {
          trait_type: 'Test Time',
          value: new Date().toISOString()
        }
      ]
    }

    const uploadPayload = {
      pinataContent: testMetadata,
      pinataMetadata: {
        name: `JWT-Test-${Date.now()}`,
        keyvalues: {
          type: 'jwt-test',
          auth_method: 'jwt'
        }
      },
      pinataOptions: {
        cidVersion: 1, // Use CIDv1 for better compatibility
      }
    }

    const uploadResponse = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      uploadPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PINATA_JWT}`,
        },
      }
    )

    console.log('✅ JSON Upload Successful!')
    console.log(`   IPFS Hash: ${uploadResponse.data.IpfsHash}`)
    console.log(`   Pin Size: ${uploadResponse.data.PinSize} bytes`)
    console.log(`   Gateway URL: https://gateway.pinata.cloud/ipfs/${uploadResponse.data.IpfsHash}`)

    // Test retrieval
    await testRetrieval(uploadResponse.data.IpfsHash)

    // Test account info
    await testAccountInfo()

    return true

  } catch (error) {
    console.log('❌ JWT Authentication Failed!')
    
    if (error.response) {
      console.log(`   Status: ${error.response.status} ${error.response.statusText}`)
      console.log(`   Error Details:`, error.response.data)
      
      if (error.response.status === 401) {
        console.log('\n💡 Troubleshooting Tips:')
        console.log('   • Check if your JWT token is valid and not expired')
        console.log('   • Ensure the JWT has the required permissions')
        console.log('   • Generate a new JWT token from Pinata dashboard')
      }
    } else {
      console.log(`   Error: ${error.message}`)
    }

    return false
  }
}

async function testRetrieval(hash) {
  try {
    console.log('\n📥 Testing Content Retrieval...')
    
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${hash}`)
    
    if (response.status === 200) {
      console.log('✅ Content Retrieval Successful!')
      console.log(`   Retrieved NFT: ${response.data.name}`)
      console.log(`   Description: ${response.data.description}`)
    } else {
      console.log('❌ Content Retrieval Failed!')
    }
    
  } catch (error) {
    console.log('❌ Retrieval Error!')
    console.log(`   Error: ${error.message}`)
  }
}

async function testAccountInfo() {
  try {
    console.log('\n📊 Testing Account Information...')
    
    const response = await axios.get('https://api.pinata.cloud/data/userPinnedDataTotal', {
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
    })
    
    console.log('✅ Account Info Retrieved!')
    console.log(`   Pin Count: ${response.data.pin_count}`)
    console.log(`   Pin Size Total: ${Math.round(response.data.pin_size_total / (1024 * 1024) * 100) / 100} MB`)
    
  } catch (error) {
    console.log('❌ Account Info Error!')
    if (error.response) {
      console.log(`   Status: ${error.response.status}`)
    } else {
      console.log(`   Error: ${error.message}`)
    }
  }
}

// Run the test
testJWTAuthentication()
  .then(success => {
    console.log('\n' + '='.repeat(60))
    if (success) {
      console.log('🎉 All JWT tests passed! Pinata is configured correctly.')
      console.log('🚀 Your NFT marketplace is ready to use IPFS storage!')
    } else {
      console.log('💥 JWT tests failed. Please check your configuration.')
      console.log('📚 Visit https://docs.pinata.cloud/docs/api-keys for help.')
    }
    console.log('='.repeat(60))
  })
  .catch(error => {
    console.error('💥 Test execution failed:', error)
  })