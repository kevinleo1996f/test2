const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000/api/marketplace';

async function testFrontendDeleteFlow() {
  console.log('🧪 Testing Frontend Delete Flow (Step by Step)');
  console.log('=============================================');
  
  try {
    // Step 1: Get initial providers list
    console.log('\n1️⃣ Getting initial providers list...');
    const initialResponse = await fetch(`${API_BASE_URL}/providers`);
    const initialData = await initialResponse.json();
    
    if (!initialData.success) {
      console.log('❌ Failed to get initial providers:', initialData.error);
      return;
    }
    
    const initialProviders = initialData.data;
    console.log(`✅ Found ${initialProviders.length} providers initially`);
    console.log('📋 Initial providers:', initialProviders.map(p => ({ name: p.name, _id: p._id, isActive: p.isActive })));
    
    if (initialProviders.length === 0) {
      console.log('❌ No providers to test delete on');
      return;
    }
    
    // Step 2: Select a provider to delete
    const providerToDelete = initialProviders[0];
    console.log(`\n2️⃣ Selected provider for deletion: "${providerToDelete.name}"`);
    console.log(`   ID: ${providerToDelete._id}`);
    console.log(`   isActive: ${providerToDelete.isActive}`);
    
    // Step 3: Simulate frontend delete operation
    console.log('\n3️⃣ Simulating frontend delete operation...');
    console.log('   Step 3a: Making DELETE request...');
    
    const deleteResponse = await fetch(`${API_BASE_URL}/providers/${providerToDelete._id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`   DELETE response status: ${deleteResponse.status}`);
    const deleteData = await deleteResponse.json();
    console.log('   DELETE response data:', deleteData);
    
    if (!deleteData.success) {
      console.log('❌ Delete operation failed:', deleteData.error);
      return;
    }
    
    console.log('✅ Delete operation successful');
    console.log(`   Provider isActive after delete: ${deleteData.data.isActive}`);
    
    // Step 4: Simulate frontend fetch after delete (like fetchProviders)
    console.log('\n4️⃣ Simulating frontend fetch after delete...');
    console.log('   Step 4a: Fetching providers list again...');
    
    const afterDeleteResponse = await fetch(`${API_BASE_URL}/providers`);
    const afterDeleteData = await afterDeleteResponse.json();
    
    if (!afterDeleteData.success) {
      console.log('❌ Failed to fetch providers after delete:', afterDeleteData.error);
      return;
    }
    
    const afterDeleteProviders = afterDeleteData.data;
    console.log(`✅ Found ${afterDeleteProviders.length} providers after delete`);
    console.log('📋 Providers after delete:', afterDeleteProviders.map(p => ({ name: p.name, _id: p._id, isActive: p.isActive })));
    
    // Step 5: Verify the deleted provider is not in the list
    const deletedProviderStillExists = afterDeleteProviders.find(p => p._id === providerToDelete._id);
    
    if (deletedProviderStillExists) {
      console.log('❌ ISSUE FOUND: Deleted provider still exists in the list!');
      console.log('   This means the frontend would still see the provider');
      console.log('   Provider details:', {
        name: deletedProviderStillExists.name,
        _id: deletedProviderStillExists._id,
        isActive: deletedProviderStillExists.isActive
      });
      
      // Check if it's because isActive is still true
      if (deletedProviderStillExists.isActive === true) {
        console.log('   🔍 Root cause: isActive is still true (soft delete not working)');
      } else if (deletedProviderStillExists.isActive === false) {
        console.log('   🔍 Root cause: isActive is false but provider still in list (filter not working)');
      }
    } else {
      console.log('✅ SUCCESS: Deleted provider correctly removed from list');
      console.log(`   Provider count: ${initialProviders.length} → ${afterDeleteProviders.length}`);
    }
    
    // Step 6: Re-activate the provider for future tests
    console.log('\n5️⃣ Re-activating provider for future tests...');
    const reactivateResponse = await fetch(`${API_BASE_URL}/providers/${providerToDelete._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive: true }),
    });
    
    const reactivateData = await reactivateResponse.json();
    console.log('   Reactivate success:', reactivateData.success);
    
    // Step 7: Verify reactivation
    console.log('\n6️⃣ Verifying reactivation...');
    const finalResponse = await fetch(`${API_BASE_URL}/providers`);
    const finalData = await finalResponse.json();
    
    if (finalData.success) {
      const finalProviders = finalData.data;
      const reactivatedProvider = finalProviders.find(p => p._id === providerToDelete._id);
      
      if (reactivatedProvider) {
        console.log('✅ Provider successfully reactivated');
        console.log(`   Final provider count: ${finalProviders.length}`);
      } else {
        console.log('❌ Provider not found after reactivation');
      }
    }
    
    console.log('\n🎉 Frontend delete flow test completed!');
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

// Run the test
testFrontendDeleteFlow(); 