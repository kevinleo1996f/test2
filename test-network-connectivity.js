const fetch = require('node-fetch');

// Test different possible API URLs
const testUrls = [
  'http://localhost:3000/api/marketplace',
  'http://127.0.0.1:3000/api/marketplace',
  'http://10.0.2.2:3000/api/marketplace', // Android emulator
  'http://192.168.1.100:3000/api/marketplace', // Common home network
  'http://192.168.0.100:3000/api/marketplace', // Alternative home network
  'http://10.0.0.100:3000/api/marketplace', // Alternative network
];

async function testNetworkConnectivity() {
  console.log('🌐 Testing Network Connectivity');
  console.log('==============================');
  console.log('');
  
  for (const url of testUrls) {
    try {
      console.log(`🔍 Testing: ${url}`);
      
      const response = await fetch(`${url}/providers`, {
        method: 'GET',
        timeout: 5000, // 5 second timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log(`✅ SUCCESS: ${url} - Found ${data.data.length} providers`);
          console.log(`   This URL should work for your frontend!`);
          console.log('');
          
          // Test delete functionality on this URL
          if (data.data.length > 0) {
            console.log(`🧪 Testing delete functionality on ${url}...`);
            const testProvider = data.data[0];
            
            const deleteResponse = await fetch(`${url}/providers/${testProvider._id}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            const deleteData = await deleteResponse.json();
            
            if (deleteData.success) {
              console.log(`✅ DELETE works on ${url}`);
              
              // Re-activate the provider
              await fetch(`${url}/providers/${testProvider._id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isActive: true }),
              });
            } else {
              console.log(`❌ DELETE failed on ${url}: ${deleteData.error}`);
            }
          }
          
          console.log('');
          console.log('🎯 RECOMMENDATION:');
          console.log(`   Update your API_BASE_URL in app/index.tsx to:`);
          console.log(`   const API_BASE_URL = '${url}';`);
          console.log('');
          return; // Found a working URL, stop testing
          
        } else {
          console.log(`❌ Failed: ${url} - ${data.error}`);
        }
      } else {
        console.log(`❌ Failed: ${url} - HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Failed: ${url} - ${error.message}`);
    }
    console.log('');
  }
  
  console.log('❌ No working URLs found!');
  console.log('');
  console.log('🔧 Troubleshooting:');
  console.log('   1. Make sure your server is running: cd server && npm start');
  console.log('   2. Check if port 3000 is available');
  console.log('   3. Try running: netstat -an | findstr :3000 (Windows) or lsof -i :3000 (Mac/Linux)');
  console.log('   4. Check your firewall settings');
  console.log('   5. Make sure your device and computer are on the same network');
}

// Also test health endpoint
async function testHealthEndpoint() {
  console.log('🏥 Testing Health Endpoint');
  console.log('==========================');
  
  const healthUrls = [
    'http://localhost:3000/health',
    'http://127.0.0.1:3000/health',
    'http://10.0.2.2:3000/health',
    'http://192.168.1.100:3000/health',
    'http://192.168.0.100:3000/health',
  ];
  
  for (const url of healthUrls) {
    try {
      console.log(`🔍 Testing health: ${url}`);
      const response = await fetch(url, { timeout: 3000 });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Health check passed: ${url} - ${JSON.stringify(data)}`);
      } else {
        console.log(`❌ Health check failed: ${url} - HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Health check error: ${url} - ${error.message}`);
    }
  }
  console.log('');
}

// Run both tests
async function runAllTests() {
  await testHealthEndpoint();
  await testNetworkConnectivity();
}

runAllTests(); 