// Simple test script to verify API endpoints are working
// Run with: node test-api.js

const BASE_URL = 'http://localhost:5174/api/analytics';

async function testEndpoint(path, name) {
  try {
    console.log(`\n🧪 Testing ${name}...`);
    const response = await fetch(`${BASE_URL}${path}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ ${name} - SUCCESS`);
    console.log(`📊 Sample data:`, JSON.stringify(data, null, 2).substring(0, 200) + '...');
    
    return data;
  } catch (error) {
    console.log(`❌ ${name} - FAILED:`, error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Testing IoT Train Analytics API Endpoints\n');
  console.log('🔗 Base URL:', BASE_URL);
  
  const tests = [
    { path: '/overview', name: 'Stats Overview' },
    { path: '/seats/availability', name: 'Seat Availability' },
    { path: '/temperature/history?hours=6', name: 'Temperature History' },
    { path: '/noise/monitoring?hours=6', name: 'Noise Monitoring' },
    { path: '/events/recent?limit=5', name: 'Recent Events' },
    { path: '/realtime', name: 'Realtime Summary' }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await testEndpoint(test.path, test.name);
    if (result) {
      passed++;
    } else {
      failed++;
    }
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📈 Test Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total:  ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Your analytics API is ready.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the backend server is running and database has data.');
  }
}

runTests().catch(console.error);