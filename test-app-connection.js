const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000/api/marketplace';

async function testAppConnection() {
  console.log('🧪 Testing App Connection to API...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing Health Check');
    const healthResponse = await fetch('http://localhost:3000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check response:', healthData);
    console.log('');

    // Test 2: Get current providers
    console.log('2️⃣ Testing Get Providers');
    const providersResponse = await fetch(`${API_BASE_URL}/providers`);
    const providersData = await providersResponse.json();
    console.log(`✅ Found ${providersData.data?.length || 0} providers`);
    console.log('');

    // Test 3: Create a test provider
    console.log('3️⃣ Testing Create Provider');
    const testProvider = {
      name: 'App Test Provider',
      type: 'Solar',
      price: 0.14,
      rating: 4.8,
      available: 75,
      description: 'Test provider created from app test script',
      location: 'Test City, TC',
      contactEmail: 'test@apptest.com',
      contactPhone: '+1-555-APPTEST'
    };

    console.log('📤 Sending provider data:', testProvider);
    const createResponse = await fetch(`${API_BASE_URL}/providers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProvider),
    });

    console.log('📥 Response status:', createResponse.status);
    const createData = await createResponse.json();
    console.log('📥 Response data:', createData);

    if (createData.success) {
      console.log('✅ Provider created successfully!');
      console.log(`   Provider ID: ${createData.data._id}`);
      console.log(`   Provider Name: ${createData.data.name}`);
      console.log('');

      // Test 4: Verify provider was added
      console.log('4️⃣ Testing Get Providers (After Create)');
      const providersResponse2 = await fetch(`${API_BASE_URL}/providers`);
      const providersData2 = await providersResponse2.json();
      console.log(`✅ Now found ${providersData2.data?.length || 0} providers`);
      
      const newProvider = providersData2.data.find(p => p.name === 'App Test Provider');
      if (newProvider) {
        console.log('✅ New provider found in database!');
        console.log(`   Name: ${newProvider.name}`);
        console.log(`   Price: $${newProvider.price}/kWh`);
        console.log(`   Available: ${newProvider.available} kWh`);
      } else {
        console.log('❌ New provider not found in database');
      }
      console.log('');

      // Test 5: Clean up - delete the test provider
      console.log('5️⃣ Testing Delete Provider (Cleanup)');
      const deleteResponse = await fetch(`${API_BASE_URL}/providers/${createData.data._id}`, {
        method: 'DELETE',
      });

      const deleteData = await deleteResponse.json();
      if (deleteData.success) {
        console.log('✅ Test provider deleted successfully');
      } else {
        console.log('❌ Failed to delete test provider:', deleteData.error);
      }

    } else {
      console.log('❌ Failed to create provider:', createData.error);
    }

    console.log('\n🎉 App connection test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. Server is running: npm run server:full');
    console.log('   2. MongoDB is connected');
    console.log('   3. Port 3000 is available');
  }
}

// Run the test
testAppConnection(); 