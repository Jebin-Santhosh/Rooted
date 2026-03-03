#!/usr/bin/env node

/**
 * Simple test script to verify React Native DentalBot app functionality
 */

const http = require('http');

const API_BASE_URL = 'http://localhost:8000';

function testAPI(endpoint, description) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`🧪 Testing ${description}: ${url}`);

    const req = http.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const jsonData = JSON.parse(data);
            console.log(`✅ ${description}: SUCCESS`);
            console.log(`   Response: ${JSON.stringify(jsonData, null, 2).substring(0, 100)}...`);
            resolve(jsonData);
          } else {
            console.log(`❌ ${description}: HTTP ${res.statusCode}`);
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        } catch (e) {
          console.log(`❌ ${description}: Invalid JSON response`);
          reject(e);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${description}: Connection failed - ${err.message}`);
      reject(err);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`❌ ${description}: Timeout`);
      reject(new Error('Timeout'));
    });
  });
}

async function runTests() {
  console.log('🚀 Testing DentalBot React Native App Integration\n');

  try {
    // Test 1: Health check
    await testAPI('/health', 'API Health Check');

    // Test 2: Echo endpoint
    await testAPI('/test/echo?message=Hello%20from%20React%20Native', 'Echo Test');

    // Test 3: Documents test
    await testAPI('/test/documents', 'Documents Database');

    console.log('\n🎉 All API tests passed! React Native app should work correctly.');
    console.log('\n📱 To start the React Native app:');
    console.log('   Web: npm run web');
    console.log('   Android: npm run android');
    console.log('   iOS: npm run ios');

  } catch (error) {
    console.log('\n❌ Some tests failed. Make sure your DentalBot server is running:');
    console.log('   python web_chatbot_auto.py');
    console.log(`\nError: ${error.message}`);
    process.exit(1);
  }
}

runTests();






