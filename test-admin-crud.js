const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000/api/marketplace';

async function testAdminCRUD() {
  console.log('🧪 Testing Admin CRUD Operations...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing Health Check');
    const healthResponse = await fetch('http://localhost:3000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check response:', healthData.status);
    console.log('');

    // Test 2: Get current providers
    console.log('2️⃣ Testing Get Providers');
    const providersResponse = await fetch(`${API_BASE_URL}/providers`);
    const providersData = await providersResponse.json();
    console.log(`✅ Found ${providersData.data?.length || 0} providers`);
    console.log('');

    // Test 3: Create a new provider
    console.log('3️⃣ Testing CREATE - Add new provider');
    const newProvider = {
      name: 'Admin Test Provider',
      type: 'Wind',
      price: 0.09,
      rating: 4.7,
      available: 120,
      description: 'Test provider created by admin CRUD test',
      location: 'Admin Test City, ATC',
      contactEmail: 'admin@testprovider.com',
      contactPhone: '+1-555-ADMIN'
    };

    console.log('📤 Creating provider:', newProvider.name);
    const createResponse = await fetch(`${API_BASE_URL}/providers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProvider),
    });

    console.log('📥 Create response status:', createResponse.status);
    const createData = await createResponse.json();
    console.log('📥 Create response data:', createData);

    if (createData.success) {
      console.log('✅ Provider created successfully!');
      const createdProviderId = createData.data._id;
      console.log(`   Provider ID: ${createdProviderId}`);
      console.log('');

      // Test 4: Update the provider
      console.log('4️⃣ Testing UPDATE - Update provider');
      const updateData = {
        price: 0.10,
        available: 150,
        rating: 4.8,
        description: 'Updated test provider description'
      };

      console.log('📤 Updating provider with:', updateData);
      const updateResponse = await fetch(`${API_BASE_URL}/providers/${createdProviderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      console.log('📥 Update response status:', updateResponse.status);
      const updateResult = await updateResponse.json();
      console.log('📥 Update response data:', updateResult);

      if (updateResult.success) {
        console.log('✅ Provider updated successfully!');
        console.log(`   New price: $${updateResult.data.price}/kWh`);
        console.log(`   New available: ${updateResult.data.available} kWh`);
        console.log(`   New rating: ${updateResult.data.rating}`);
        console.log('');

        // Test 5: Verify the update
        console.log('5️⃣ Testing READ - Verify update');
        const verifyResponse = await fetch(`${API_BASE_URL}/providers/${createdProviderId}`);
        const verifyData = await verifyResponse.json();
        
        if (verifyData.success) {
          console.log('✅ Provider verification successful!');
          console.log(`   Name: ${verifyData.data.name}`);
          console.log(`   Price: $${verifyData.data.price}/kWh`);
          console.log(`   Available: ${verifyData.data.available} kWh`);
          console.log(`   Rating: ${verifyData.data.rating}`);
          console.log('');
        }

        // Test 6: Delete the provider (soft delete)
        console.log('6️⃣ Testing DELETE - Deactivate provider');
        const deleteResponse = await fetch(`${API_BASE_URL}/providers/${createdProviderId}`, {
          method: 'DELETE',
        });

        console.log('📥 Delete response status:', deleteResponse.status);
        const deleteResult = await deleteResponse.json();
        console.log('📥 Delete response data:', deleteResult);

        if (deleteResult.success) {
          console.log('✅ Provider deactivated successfully!');
          console.log(`   Status: ${deleteResult.data.isActive ? 'Active' : 'Inactive'}`);
          console.log('');
        }

        // Test 7: Verify deletion
        console.log('7️⃣ Testing READ - Verify deletion');
        const finalProvidersResponse = await fetch(`${API_BASE_URL}/providers`);
        const finalProvidersData = await finalProvidersResponse.json();
        
        const deletedProvider = finalProvidersData.data.find(p => p._id === createdProviderId);
        if (deletedProvider && !deletedProvider.isActive) {
          console.log('✅ Provider successfully deactivated!');
        } else if (!deletedProvider) {
          console.log('✅ Provider completely removed!');
        } else {
          console.log('⚠️ Provider still active after deletion');
        }

      } else {
        console.log('❌ Failed to update provider:', updateResult.error);
      }

    } else {
      console.log('❌ Failed to create provider:', createData.error);
    }

    // Test 8: Final providers count
    console.log('8️⃣ Testing READ - Final providers count');
    const finalResponse = await fetch(`${API_BASE_URL}/providers`);
    const finalData = await finalResponse.json();
    console.log(`✅ Final provider count: ${finalData.data?.length || 0}`);

    console.log('\n🎉 Admin CRUD test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. Server is running: npm run server:full');
    console.log('   2. MongoDB is connected');
    console.log('   3. Port 3000 is available');
  }
}

// Run the test
testAdminCRUD(); 