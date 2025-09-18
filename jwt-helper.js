/**
 * Pinata JWT Token Helper
 * 
 * Helps generate and validate Pinata JWT tokens
 */

const axios = require('axios')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config()
dotenv.config({ path: '.env.local' })

console.log('🔑 Pinata JWT Token Helper\n')

async function createJWTToken() {
  console.log('📝 To get a valid JWT token from Pinata:')
  console.log('1. Go to https://app.pinata.cloud/')
  console.log('2. Sign in to your account')
  console.log('3. Navigate to "API Keys" section')
  console.log('4. Click "New Key"')
  console.log('5. Give it a name (e.g., "MetaLease NFT Marketplace")')
  console.log('6. Select permissions:')
  console.log('   ✅ pinFileToIPFS')
  console.log('   ✅ pinJSONToIPFS') 
  console.log('   ✅ unpin')
  console.log('   ✅ userPinnedDataTotal')
  console.log('7. Click "Create Key"')
  console.log('8. Copy the JWT token (long string starting with "eyJ...")')
  console.log('9. Add it to your .env.local file as PINATA_JWT=your_token_here\n')
}

async function validateExistingToken() {
  const jwt = process.env.PINATA_JWT || process.env.NEXT_PUBLIC_PINATA_JWT
  
  if (!jwt) {
    console.log('❌ No JWT token found in environment variables')
    return false
  }

  console.log('🔍 Validating existing JWT token...')
  console.log(`   Token length: ${jwt.length} characters`)
  console.log(`   Token preview: ${jwt.substring(0, 50)}...`)
  
  try {
    // Test the token
    const response = await axios.get('https://api.pinata.cloud/data/testAuthentication', {
      headers: {
        'Authorization': `Bearer ${jwt}`,
      },
    })

    console.log('✅ JWT token is valid!')
    console.log(`   Status: ${response.status}`)
    console.log(`   Message: ${response.data.message}`)
    
    return true
    
  } catch (error) {
    console.log('❌ JWT token validation failed!')
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`)
      console.log(`   Error: ${error.response.data.error?.reason || error.response.statusText}`)
      
      if (error.response.data.error?.details) {
        console.log(`   Details: ${error.response.data.error.details}`)
      }
    } else {
      console.log(`   Error: ${error.message}`)
    }
    
    return false
  }
}

async function generateTestToken() {
  // This is a demonstration of what a valid JWT structure looks like
  console.log('\n💡 JWT Token Structure:')
  console.log('A valid Pinata JWT token has three parts separated by dots:')
  console.log('   [Header].[Payload].[Signature]')
  console.log('')
  console.log('Example structure:')
  console.log('   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.')
  console.log('   eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5YzE4...')
  console.log('   A1s61j0BQFGfKfBG1EZ5hPCXh1jKWNVXhFKyYHZ6T6o')
  console.log('')
  console.log('⚠️  The token must be generated from your Pinata dashboard')
  console.log('⚠️  Cannot be generated programmatically for security reasons')
}

async function main() {
  await createJWTToken()
  
  const isValid = await validateExistingToken()
  
  if (!isValid) {
    console.log('\n🔧 Next Steps:')
    console.log('1. Generate a new JWT token from Pinata dashboard')
    console.log('2. Update your .env.local file with the new token')
    console.log('3. Run this test again to verify')
    
    await generateTestToken()
  } else {
    console.log('\n🎉 Your JWT token is working correctly!')
    console.log('✅ You can now use Pinata for IPFS uploads')
  }
}

main().catch(console.error)