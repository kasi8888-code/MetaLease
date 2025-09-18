# IPFS & Pinata Testing Documentation

This document describes the comprehensive test suite for Pinata IPFS integration in the MetaLease NFT rental platform.

## Test Structure

```
src/__tests__/
├── services/
│   ├── ipfs.test.ts                 # Main IPFS service tests
│   ├── ipfs.integration.test.ts     # End-to-end integration tests
│   └── ipfs.connection.test.ts      # Pinata connection health tests
├── fixtures/
│   └── mockData.ts                  # Test data and mock utilities
└── setup files
    ├── jest.config.js               # Jest configuration
    └── jest.setup.js                # Global test setup
```

## Test Coverage

### 1. Connection Tests (`ipfs.connection.test.ts`)
- **API Authentication**: Tests Pinata API key validation and authentication
- **Endpoint Validation**: Verifies correct API endpoints are used
- **Request Format**: Validates FormData and JSON request structures
- **Response Handling**: Tests hash extraction and error handling
- **Error Scenarios**: Covers 401, 402, 429, 500, 503 HTTP status codes

### 2. Core Functionality Tests (`ipfs.test.ts`)
- **Configuration**: Environment variable loading and gateway URL construction
- **File Upload**: Image file uploads with different formats and sizes
- **Metadata Upload**: JSON metadata structure validation
- **Hash Generation**: Mock hash generation for fallback scenarios
- **Retrieval**: Metadata fetching from IPFS and localStorage
- **Error Handling**: Network failures, rate limiting, malformed responses
- **Mock Simulation**: Realistic upload delays and unique hash generation

### 3. Integration Tests (`ipfs.integration.test.ts`)
- **Complete NFT Workflow**: Image upload → metadata creation → metadata upload
- **Mixed Success/Failure**: Handles partial failures gracefully
- **Concurrent Uploads**: Tests multiple simultaneous uploads
- **Performance**: Validates upload/retrieval cycles
- **Real API Integration**: Optional tests with actual Pinata API

## Running Tests

### Quick Test Commands
```bash
# Run all IPFS tests
npm run test:ipfs

# Run specific test categories
npm test -- ipfs.test.ts           # Core functionality
npm test -- ipfs.integration.test.ts # Integration tests
npm test -- ipfs.connection.test.ts  # Connection health

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Specialized Test Scripts
```bash
# Test Pinata connection health
npm run test:ipfs:connection

# Test with real Pinata API (requires credentials)
node scripts/test-pinata-connection.js
```

## Environment Setup

### Test Environment Variables
```bash
# Required for all tests
NEXT_PUBLIC_PINATA_API_KEY=test_api_key
NEXT_PUBLIC_PINATA_SECRET_KEY=test_secret_key
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/

# Optional for real API testing
PINATA_API_KEY=your_real_pinata_api_key
PINATA_SECRET_KEY=your_real_pinata_secret_key
```

### Jest Configuration
- **Environment**: jsdom (for browser-like localStorage)
- **Timeout**: 30 seconds (for IPFS operations)
- **Module Mapping**: `@/` → `src/`
- **Coverage**: Excludes stories, types, and index files

## Test Data & Mocks

### Mock NFT Metadata
```typescript
{
  name: 'Test NFT',
  description: 'This is a test NFT for unit testing purposes',
  image: 'QmTestImageHash123',
  attributes: [
    { trait_type: 'Color', value: 'Blue' },
    { trait_type: 'Rarity', value: 'Common' },
    { trait_type: 'Type', value: 'Test' }
  ]
}
```

### Mock File Generation
- **Image Types**: JPG, PNG, GIF, WebP
- **Size Range**: 1KB to 10MB
- **Content**: Randomized binary data

### Mock IPFS Responses
- **Image Hash Pattern**: `QmImage[timestamp][random9chars]`
- **Metadata Hash Pattern**: `QmMetadata[timestamp][random9chars]`
- **Upload Delays**: 1-3 seconds (realistic simulation)

## Test Scenarios

### Success Cases ✅
1. **Valid API Keys**: Successful authentication and upload
2. **Multiple File Types**: JPG, PNG, GIF, WebP support
3. **Large Files**: 10MB+ file handling
4. **Concurrent Uploads**: Multiple simultaneous uploads
5. **Complete Workflow**: Image → metadata → retrieval cycle

### Failure Cases ❌
1. **Authentication Errors**: Invalid API keys (401)
2. **Rate Limiting**: Too many requests (429)
3. **Insufficient Credits**: Payment required (402)
4. **Network Issues**: Connection timeouts and failures
5. **Malformed Responses**: Invalid JSON or missing hash
6. **Server Errors**: 500/503 status codes

### Fallback Cases 🔄
1. **Missing Credentials**: Automatic fallback to mock uploads
2. **API Failures**: Graceful degradation to local storage
3. **Network Timeouts**: Mock upload with realistic delays
4. **Service Unavailable**: Local hash generation

## Debugging & Troubleshooting

### Common Issues

#### Test Timeout Errors
```bash
# Increase Jest timeout
jest.setTimeout(60000)

# Or in jest.config.js
testTimeout: 60000
```

#### Mock Not Working
```bash
# Clear all mocks between tests
beforeEach(() => {
  jest.clearAllMocks()
})
```

#### Environment Variables Not Loading
```bash
# Check jest.setup.js for proper environment setup
process.env.NEXT_PUBLIC_PINATA_API_KEY = 'test_api_key'
```

### Debugging Commands
```bash
# Run tests with verbose output
npm test -- --verbose

# Run single test file with debugging
npm test -- --testNamePattern="should upload image" --verbose

# Debug with Node.js inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Real API Testing

To test with your actual Pinata credentials:

1. **Set Real Credentials**:
   ```bash
   # In your .env.local file
   PINATA_API_KEY=your_actual_api_key
   PINATA_SECRET_KEY=your_actual_secret_key
   ```

2. **Run Connection Test**:
   ```bash
   node scripts/test-pinata-connection.js
   ```

3. **Expected Output**:
   ```
   ✅ Pinata connection successful: { authenticated: true }
   🎉 Your IPFS setup is ready for NFT uploads!
   ```

## Integration with MetaLease Platform

### NFT Creation Flow Testing
1. **Image Upload**: Tests file selection and Pinata upload
2. **Metadata Generation**: Tests NFT metadata structure
3. **Hash Validation**: Tests IPFS hash format and retrieval
4. **Error Recovery**: Tests fallback mechanisms

### Dashboard Integration Testing
1. **NFT Display**: Tests metadata retrieval for owned NFTs
2. **Image Loading**: Tests IPFS gateway URL generation
3. **Cache Management**: Tests localStorage fallback

### Performance Monitoring
- Upload time tracking
- File size optimization
- Concurrent upload limits
- Error rate monitoring

## Continuous Integration

### GitHub Actions Integration
```yaml
# .github/workflows/test.yml
- name: Run IPFS Tests
  run: |
    npm run test:ipfs
    npm run test:coverage
```

### Test Reports
- **Coverage Reports**: Generated in `coverage/` directory
- **Test Results**: JUnit XML format for CI integration
- **Performance Metrics**: Upload time and success rates

## Contributing

When adding new IPFS functionality:

1. **Add Unit Tests**: Cover new functions/methods
2. **Update Integration Tests**: Test new workflows
3. **Add Error Handling**: Test failure scenarios
4. **Update Documentation**: Document new test cases
5. **Verify Coverage**: Maintain >90% test coverage

### Test Naming Convention
```typescript
// Format: should [action] [condition/context]
test('should upload image file successfully with valid credentials', ...)
test('should fall back to mock upload when API fails', ...)
test('should handle rate limiting gracefully', ...)
```

## Performance Benchmarks

### Target Metrics
- **Upload Success Rate**: >95%
- **Average Upload Time**: <5 seconds
- **Error Recovery Time**: <2 seconds
- **Test Suite Runtime**: <60 seconds

### Monitoring
Use the test suite to monitor:
- API response times
- Error frequencies
- Fallback activation rates
- Upload success patterns

---

For questions or issues with the IPFS testing suite, check the test files or run the connection diagnostic script.