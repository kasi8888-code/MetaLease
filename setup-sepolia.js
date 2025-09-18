#!/usr/bin/env node

console.log('🌐 MetaLease Sepolia Setup Helper\n');

const SEPOLIA_FAUCETS = [
  {
    name: 'Sepolia Faucet (Primary)',
    url: 'https://sepoliafaucet.com/',
    description: '0.5 SEP per day - Email required'
  },
  {
    name: 'Alchemy Sepolia Faucet',
    url: 'https://sepoliafaucet.com/',
    description: '0.5 SEP per day - Email required'
  },
  {
    name: 'QuickNode Faucet',
    url: 'https://faucet.quicknode.com/ethereum/sepolia',
    description: '0.05 SEP per request - Twitter required'
  },
  {
    name: 'Infura Faucet',
    url: 'https://infura.io/faucet/sepolia',
    description: '0.5 SEP per day - Account required'
  }
];

const CONTRACT_INFO = {
  network: 'Sepolia Testnet',
  chainId: 11155111,
  contracts: {
    'RentableNFT': '0x4e3544cB317c9c42F9898D18681F4873da7c76fd',
    'Marketplace': '0xDeCb458F3aA179510A547e47b45F59fD2d5C3c56'
  },
  explorer: 'https://sepolia.etherscan.io'
};

console.log('📋 Setup Checklist:\n');

console.log('1️⃣ MetaMask Configuration:');
console.log('   • Network Name: Sepolia test network');
console.log('   • Chain ID: 11155111');
console.log('   • Currency: SEP');
console.log('   • RPC URL: https://rpc.sepolia.org');
console.log('   • Block Explorer: https://sepolia.etherscan.io\n');

console.log('2️⃣ Get Sepolia Test ETH:');
SEPOLIA_FAUCETS.forEach((faucet, index) => {
  console.log(`   ${index + 1}. ${faucet.name}`);
  console.log(`      URL: ${faucet.url}`);
  console.log(`      Info: ${faucet.description}\n`);
});

console.log('3️⃣ Your MetaLease Contracts:');
Object.entries(CONTRACT_INFO.contracts).forEach(([name, address]) => {
  console.log(`   • ${name}: ${address}`);
  console.log(`     View: ${CONTRACT_INFO.explorer}/address/${address}`);
});

console.log('\n4️⃣ Verify Setup:');
console.log('   • Start app: npm run dev');
console.log('   • Visit: http://localhost:3000');
console.log('   • Connect wallet and ensure you\'re on Sepolia');
console.log('   • Check your SEP balance shows up');

console.log('\n5️⃣ Test Complete Flow:');
console.log('   • Create NFT → Upload image + metadata to IPFS');
console.log('   • List for Rent → Set hourly/daily rates');
console.log('   • Browse Marketplace → See available NFTs');
console.log('   • Rent NFT → Pay with SEP tokens');

console.log('\n✨ Your platform is ready for Sepolia testnet!');
console.log('\n🔗 Helpful Links:');
console.log('   • MetaMask Help: https://metamask.zendesk.com');
console.log('   • Sepolia Explorer: https://sepolia.etherscan.io');
console.log('   • IPFS Gateway: https://gateway.pinata.cloud/ipfs/');

console.log('\n💡 Need help? Check SEPOLIA_SETUP_GUIDE.md for detailed instructions!');