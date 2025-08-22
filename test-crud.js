const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000/api/marketplace';

async function testCRUD() {
  console.log('🧪 Testing CRUD Operations...\n');

  try {
    // Test 1: Get all providers
    console.log('1️⃣ Testing READ - Get all providers');
    const providersResponse = await fetch(`${API_BASE_URL}/providers`);
    const providersData = await providersResponse.json();
    console.log(`✅ Found ${providersData.data?.length || 0} providers\n`);

    // Test 2: Create a new provider
    console.log('2️⃣ Testing CREATE - Add new provider');
    const newProvider = {
      name: 'Test Energy Co',
      type: 'Solar',
      price: 0.11,
      rating: 4.3,
      available: 75,
      description: 'Test solar energy provider for CRUD testing',
      location: 'Test City, TS',
      contactEmail: 'test@testenergy.com',
      contactPhone: '+1-555-TEST'
    };

    const createResponse = await fetch(`${API_BASE_URL}/providers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProvider),
    });

    const createData = await createResponse.json();
    
    if (createData.success) {
      console.log('✅ Provider created successfully');
      const createdProviderId = createData.data._id;
      console.log(`   Provider ID: ${createdProviderId}\n`);

      // Test 3: Update the provider
      console.log('3️⃣ Testing UPDATE - Update provider');
      const updateData = {
        price: 0.12,
        available: 100,
        rating: 4.5
      };

      const updateResponse = await fetch(`${API_BASE_URL}/providers/${createdProviderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const updateResult = await updateResponse.json();
      
      if (updateResult.success) {
        console.log('✅ Provider updated successfully');
        console.log(`   New price: $${updateResult.data.price}/kWh`);
        console.log(`   New available: ${updateResult.data.available} kWh\n`);

        // Test 4: Create a purchase
        console.log('4️⃣ Testing CREATE - Create purchase');
        const purchaseData = {
          userId: 'testuser123',
          providerId: createdProviderId,
          amount: 25,
          paymentMethod: 'credit_card',
          notes: 'Test purchase for CRUD testing'
        };

        const purchaseResponse = await fetch(`${API_BASE_URL}/purchases`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(purchaseData),
        });

        const purchaseResult = await purchaseResponse.json();
        
        if (purchaseResult.success) {
          console.log('✅ Purchase created successfully');
          console.log(`   Transaction ID: ${purchaseResult.data.transactionId}`);
          console.log(`   Cost: $${purchaseResult.data.cost}\n`);

          // Test 5: Get user purchases
          console.log('5️⃣ Testing READ - Get user purchases');
          const userPurchasesResponse = await fetch(`${API_BASE_URL}/purchases/testuser123`);
          const userPurchasesData = await userPurchasesResponse.json();
          
          if (userPurchasesData.success) {
            console.log(`✅ Found ${userPurchasesData.data.length} purchases for user\n`);
          }

          // Test 6: Delete the provider (soft delete)
          console.log('6️⃣ Testing DELETE - Deactivate provider');
          const deleteResponse = await fetch(`${API_BASE_URL}/providers/${createdProviderId}`, {
            method: 'DELETE',
          });

          const deleteResult = await deleteResponse.json();
          
          if (deleteResult.success) {
            console.log('✅ Provider deactivated successfully');
            console.log(`   Status: ${deleteResult.data.isActive ? 'Active' : 'Inactive'}\n`);
          }

        } else {
          console.log('❌ Failed to create purchase:', purchaseResult.error);
        }

      } else {
        console.log('❌ Failed to update provider:', updateResult.error);
      }

    } else {
      console.log('❌ Failed to create provider:', createData.error);
    }

    // Test 7: Get analytics
    console.log('7️⃣ Testing READ - Get analytics');
    const analyticsResponse = await fetch(`${API_BASE_URL}/analytics`);
    const analyticsData = await analyticsResponse.json();
    
    if (analyticsData.success) {
      console.log('✅ Analytics retrieved successfully');
      console.log(`   Total providers: ${analyticsData.data.totalProviders}`);
      console.log(`   Total purchases: ${analyticsData.data.totalPurchases}`);
      console.log(`   Total revenue: $${analyticsData.data.totalRevenue}\n`);
    }

    console.log('🎉 All CRUD tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running: npm run server:full');
  }
}

// Run the test
testCRUD(); 