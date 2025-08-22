const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000/api/marketplace';

async function testCompleteDeleteFlow() {
  try {
    console.log('🧪 Testing Complete Delete Flow');
    console.log('==============================');
    
    // Step 1: Get initial providers
    console.log('\n1️⃣ Getting initial providers...');
    const initialResponse = await fetch(`${API_BASE_URL}/providers`);
    const initialData = await initialResponse.json();
    
    if (!initialData.success) {
      console.log('❌ Failed to get initial providers:', initialData.error);
      return;
    }
    
    console.log(`✅ Found ${initialData.data.length} active providers`);
    console.log('📋 Provider names:', initialData.data.map(p => p.name));
    console.log('📋 Provider IDs:', initialData.data.map(p => p._id));
    console.log('📋 isActive status:', initialData.data.map(p => p.isActive));
    
    if (initialData.data.length === 0) {
      console.log('❌ No providers to test with');
      return;
    }
    
    // Step 2: Select a provider to delete
    const providerToDelete = initialData.data[0];
    console.log(`\n2️⃣ Selected provider for deletion: "${providerToDelete.name}"`);
    console.log(`   ID: ${providerToDelete._id}`);
    console.log(`   Current isActive: ${providerToDelete.isActive}`);
    
    // Step 3: Delete the provider
    console.log('\n3️⃣ Deleting provider...');
    const deleteResponse = await fetch(`${API_BASE_URL}/providers/${providerToDelete._id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('   Delete response status:', deleteResponse.status);
    const deleteData = await deleteResponse.json();
    console.log('   Delete response data:', deleteData);
    
    if (!deleteData.success) {
      console.log('❌ Delete failed:', deleteData.error);
      return;
    }
    
    console.log('✅ Delete successful');
    console.log(`   Updated isActive: ${deleteData.data.isActive}`);
    
    // Step 4: Verify provider is removed from active list
    console.log('\n4️⃣ Verifying provider is removed from active list...');
    const afterDeleteResponse = await fetch(`${API_BASE_URL}/providers`);
    const afterDeleteData = await afterDeleteResponse.json();
    
    if (!afterDeleteData.success) {
      console.log('❌ Failed to get providers after delete:', afterDeleteData.error);
      return;
    }
    
    console.log(`✅ Found ${afterDeleteData.data.length} active providers after delete`);
    console.log('📋 Remaining provider names:', afterDeleteData.data.map(p => p.name));
    
    const deletedProviderStillActive = afterDeleteData.data.find(p => p._id === providerToDelete._id);
    if (deletedProviderStillActive) {
      console.log('❌ PROBLEM: Deleted provider still appears in active list!');
      console.log('   Provider details:', {
        name: deletedProviderStillActive.name,
        _id: deletedProviderStillActive._id,
        isActive: deletedProviderStillActive.isActive
      });
    } else {
      console.log('✅ SUCCESS: Deleted provider correctly removed from active list');
    }
    
    // Step 5: Verify provider still exists in database (soft delete)
    console.log('\n5️⃣ Verifying provider still exists in database (soft delete)...');
    const singleProviderResponse = await fetch(`${API_BASE_URL}/providers/${providerToDelete._id}`);
    const singleProviderData = await singleProviderResponse.json();
    
    if (singleProviderResponse.status === 404) {
      console.log('❌ Provider completely removed from database (not soft delete)');
    } else if (singleProviderData.success) {
      console.log('✅ Provider still exists in database (soft delete working)');
      console.log(`   isActive status: ${singleProviderData.data.isActive}`);
    } else {
      console.log('❌ Unexpected response:', singleProviderData);
    }
    
    // Step 6: Re-activate provider for future tests
    console.log('\n6️⃣ Re-activating provider for future tests...');
    const reactivateResponse = await fetch(`${API_BASE_URL}/providers/${providerToDelete._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive: true }),
    });
    
    const reactivateData = await reactivateResponse.json();
    if (reactivateData.success) {
      console.log('✅ Provider re-activated successfully');
    } else {
      console.log('❌ Failed to re-activate provider:', reactivateData.error);
    }
    
    // Step 7: Final verification
    console.log('\n7️⃣ Final verification...');
    const finalResponse = await fetch(`${API_BASE_URL}/providers`);
    const finalData = await finalResponse.json();
    
    console.log(`✅ Final provider count: ${finalData.data.length}`);
    console.log('📋 Final provider names:', finalData.data.map(p => p.name));
    
    console.log('\n🎉 Complete delete flow test finished!');
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

testCompleteDeleteFlow(); 