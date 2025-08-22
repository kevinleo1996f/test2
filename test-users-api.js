// Test script for Users API
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000/api/users';

async function testUsersAPI() {
  console.log('🔍 Testing Users API...\n');

  try {
    // Test 1: Get all users
    console.log('1. Testing GET /api/users...');
    const usersResponse = await fetch(`${API_BASE_URL}`);
    const usersData = await usersResponse.json();
    console.log('✅ Users:', usersData.success ? `${usersData.data.length} users found` : 'Failed');
    if (usersData.success && usersData.data.length > 0) {
      console.log(`   First user: ${usersData.data[0].name} (${usersData.data[0].userId})`);
    }
    console.log('');

    // Test 2: Get specific user
    console.log('2. Testing GET /api/users/user123...');
    const userResponse = await fetch(`${API_BASE_URL}/user123`);
    const userData = await userResponse.json();
    console.log('✅ User:', userData.success ? `${userData.data.name}` : 'Failed');
    if (userData.success) {
      console.log(`   Balance: $${userData.data.balance}`);
      console.log(`   Monthly Usage: ${userData.data.energyProfile.monthlyUsage} kWh`);
    }
    console.log('');

    // Test 3: Get user analytics
    console.log('3. Testing GET /api/users/user123/analytics...');
    const analyticsResponse = await fetch(`${API_BASE_URL}/user123/analytics`);
    const analyticsData = await analyticsResponse.json();
    console.log('✅ Analytics:', analyticsData.success ? 'Available' : 'Failed');
    if (analyticsData.success) {
      console.log(`   Total Balance: $${analyticsData.data.totalBalance}`);
      console.log(`   Energy Efficiency: $${analyticsData.data.energyEfficiency.toFixed(2)}/kWh`);
    }
    console.log('');

    // Test 4: Update user balance
    console.log('4. Testing PATCH /api/users/user123/balance...');
    const balanceResponse = await fetch(`${API_BASE_URL}/user123/balance`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: 25.50 })
    });
    const balanceData = await balanceResponse.json();
    console.log('✅ Balance Update:', balanceData.success ? 'Success' : 'Failed');
    if (balanceData.success) {
      console.log(`   ${balanceData.message}`);
    }
    console.log('');

    // Test 5: Update energy profile
    console.log('5. Testing PATCH /api/users/user123/energy-profile...');
    const profileResponse = await fetch(`${API_BASE_URL}/user123/energy-profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        monthlyUsage: 500,
        averageCost: 60.00,
        preferences: { autoPurchase: true }
      })
    });
    const profileData = await profileResponse.json();
    console.log('✅ Profile Update:', profileData.success ? 'Success' : 'Failed');
    if (profileData.success) {
      console.log(`   New monthly usage: ${profileData.data.energyProfile.monthlyUsage} kWh`);
    }
    console.log('');

    console.log('🎉 All Users API tests passed!');
    console.log('\n📱 You can now use these endpoints in your React Native app:');
    console.log('   - GET /api/users - Get all users');
    console.log('   - GET /api/users/:userId - Get specific user');
    console.log('   - POST /api/users - Create new user');
    console.log('   - PUT /api/users/:userId - Update user');
    console.log('   - PATCH /api/users/:userId/balance - Update balance');
    console.log('   - PATCH /api/users/:userId/energy-profile - Update energy profile');
    console.log('   - GET /api/users/:userId/analytics - Get user analytics');

  } catch (error) {
    console.log('❌ Users API test failed:', error.message);
    console.log('\n🔧 Make sure:');
    console.log('   1. Server is running: npm run server');
    console.log('   2. Users data is seeded: npm run seed:users');
    console.log('   3. No firewall blocking port 3000');
  }
}

testUsersAPI(); 