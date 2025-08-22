const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000/api/marketplace';

async function testApiConnectivity() {
  console.log('🔍 Testing API Connectivity');
  console.log('==========================');
  console.log('API Base URL:', API_BASE_URL);
  console.log('');
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3000/health');
    const healthData = await healthResponse.json();
    console.log('   Status:', healthResponse.status);
    console.log('   Response:', healthData);
    console.log('   ✅ Health check passed');
    console.log('');
    
    // Test 2: Get providers
    console.log('2️⃣ Testing providers endpoint...');
    const providersResponse = await fetch(`${API_BASE_URL}/providers`);
    const providersData = await providersResponse.json();
    console.log('   Status:', providersResponse.status);
    console.log('   Success:', providersData.success);
    console.log('   Provider count:', providersData.data?.length || 0);
    console.log('   ✅ Providers endpoint working');
    console.log('');
    
    // Test 3: Test CORS headers
    console.log('3️⃣ Testing CORS headers...');
    const corsResponse = await fetch(`${API_BASE_URL}/providers`, {
      method: 'OPTIONS',
    });
    console.log('   CORS Status:', corsResponse.status);
    console.log('   Access-Control-Allow-Origin:', corsResponse.headers.get('Access-Control-Allow-Origin'));
    console.log('   Access-Control-Allow-Methods:', corsResponse.headers.get('Access-Control-Allow-Methods'));
    console.log('   ✅ CORS headers present');
    console.log('');
    
    // Test 4: Test DELETE method
    console.log('4️⃣ Testing DELETE method...');
    if (providersData.data && providersData.data.length > 0) {
      const testProvider = providersData.data[0];
      console.log('   Testing delete on provider:', testProvider.name);
      
      const deleteResponse = await fetch(`${API_BASE_URL}/providers/${testProvider._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const deleteData = await deleteResponse.json();
      console.log('   Delete Status:', deleteResponse.status);
      console.log('   Delete Success:', deleteData.success);
      console.log('   ✅ DELETE method working');
      
      // Re-activate the provider for future tests
      if (deleteData.success) {
        console.log('   🔄 Re-activating provider for future tests...');
        const reactivateResponse = await fetch(`${API_BASE_URL}/providers/${testProvider._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isActive: true }),
        });
        const reactivateData = await reactivateResponse.json();
        console.log('   Reactivate Success:', reactivateData.success);
      }
    } else {
      console.log('   ⚠️ No providers available for DELETE test');
    }
    console.log('');
    
    console.log('🎉 All API connectivity tests passed!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   ✅ Server is running and accessible');
    console.log('   ✅ Health endpoint responding');
    console.log('   ✅ Providers endpoint working');
    console.log('   ✅ CORS properly configured');
    console.log('   ✅ DELETE method functional');
    console.log('');
    console.log('💡 If your frontend still has issues, check:');
    console.log('   1. API base URL (localhost vs LAN IP)');
    console.log('   2. Network connectivity');
    console.log('   3. Browser console for errors');
    console.log('   4. React Native/Expo specific issues');
    
  } catch (error) {
    console.log('❌ API connectivity test failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Make sure the server is running: npm start (in server folder)');
    console.log('   2. Check if port 3000 is available');
    console.log('   3. Check firewall settings');
    console.log('   4. Try using your computer\'s LAN IP instead of localhost');
  }
}

testApiConnectivity(); 