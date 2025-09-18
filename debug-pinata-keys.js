/**
 * Debug Pinata API Credentials
 */

const dotenv = require('dotenv')

// Load environment variables
dotenv.config()
dotenv.config({ path: '.env.local' })

console.log('🔍 Debug: Pinata API Credentials')
console.log('================================')

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || process.env.PINATA_API_KEY
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || process.env.PINATA_SECRET_KEY

console.log(`API Key: ${PINATA_API_KEY}`)
console.log(`Secret Key: ${PINATA_SECRET_KEY}`)
console.log(`API Key Length: ${PINATA_API_KEY ? PINATA_API_KEY.length : 0}`)
console.log(`Secret Key Length: ${PINATA_SECRET_KEY ? PINATA_SECRET_KEY.length : 0}`)

console.log('\nAll Environment Variables:')
Object.keys(process.env).filter(key => key.includes('PINATA')).forEach(key => {
  console.log(`${key}: ${process.env[key]}`)
})