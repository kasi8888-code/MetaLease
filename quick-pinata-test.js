/**
 * Simple Pinata Connection Test (Updated Keys)
 */

const axios = require('axios')

async function quickTest() {
  const API_KEY = 'af9c6a35065e1140e73e'
  const SECRET_KEY = '0af8379a021c0aebf8af9acbe469bcc0280474504e79e083d1fa960a8a15db786'

  console.log('🔧 Quick Pinata Connection Test...\n')

  try {
    const response = await axios.get('https://api.pinata.cloud/data/testAuthentication', {
      headers: {
        'pinata_api_key': API_KEY,
        'pinata_secret_api_key': SECRET_KEY,
      },
    })

    console.log('✅ Success! Status:', response.status)
    console.log('Response:', response.data)

    // Try a simple upload test
    console.log('\n📤 Testing simple upload...')
    
    const testData = {
      hello: 'world',
      test: true,
      timestamp: Date.now()
    }

    const uploadResponse = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      pinataContent: testData,
      pinataMetadata: {
        name: `QuickTest-${Date.now()}`,
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': API_KEY,
        'pinata_secret_api_key': SECRET_KEY,
      },
    })

    console.log('✅ Upload Success!')
    console.log('IPFS Hash:', uploadResponse.data.IpfsHash)
    console.log('Gateway URL:', `https://gateway.pinata.cloud/ipfs/${uploadResponse.data.IpfsHash}`)

  } catch (error) {
    console.log('❌ Error:', error.response?.status, error.response?.statusText)
    if (error.response?.data) {
      console.log('Details:', error.response.data)
    }
  }
}

quickTest()