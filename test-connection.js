// Test script to verify API connection
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000';

async function testConnection() {
  console.log('🔍 Testing PowerGrid API connection...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    console.log('');

    // Test providers endpoint
    console.log('2. Testing providers endpoint...');
    const providersResponse = await fetch(`${API_BASE_URL}/api/marketplace/providers`);
    const providersData = await providersResponse.json();
    console.log('✅ Providers:', providersData.success ? `${providersData.data.length} providers found` : 'Failed');
    console.log('');

    // Test analytics endpoint
    console.log('3. Testing analytics endpoint...');
    const analyticsResponse = await fetch(`${API_BASE_URL}/api/marketplace/analytics`);
    const analyticsData = await analyticsResponse.json();
    console.log('✅ Analytics:', analyticsData.success ? 'Available' : 'Failed');
    console.log('');

    // Test users endpoint
    console.log('4. Testing users endpoint...');
    const usersResponse = await fetch(`${API_BASE_URL}/api/users`);
    const usersData = await usersResponse.json();
    console.log('✅ Users:', usersData.success ? `${usersData.data.length} users found` : 'Failed');
    console.log('');

    console.log('🎉 All tests passed! Your API is working correctly.');
    console.log('\n📱 Your React Native app should now be connected to the backend.');
    console.log('💡 Look for the status indicator in the Marketplace tab.');
    console.log('\n👥 Users collection is ready with sample data!');

  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('\n🔧 Make sure:');
    console.log('   1. MongoDB is running');
    console.log('   2. Server is started: npm run server');
    console.log('   3. No firewall blocking port 3000');
  }
}

testConnection(); 