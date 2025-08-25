// CRUD utility functions for the PowerGrid application

// API connection check
export const checkApiConnection = async (
  API_ORIGIN: string,
  setApiStatus: (status: string) => void
): Promise<boolean> => {
  try {
    console.log('🔍 Checking API connection...');
    const response = await fetch(`${API_ORIGIN}/health`);
    console.log('📥 Health check response status:', response.status);
    const data = await response.json();
    console.log('📥 Health check response data:', data);
    
    if (data.status === 'OK') {
      console.log('✅ API connection successful');
      setApiStatus('connected');
      return true;
    } else {
      console.log('❌ API health check failed:', data);
      setApiStatus('disconnected');
      return false;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log('❌ API not connected:', error.message);
    } else {
      console.log('❌ API not connected:', error);
    }
    setApiStatus('disconnected');
    return false;
  }
};

// Fetch all electricity providers
export const fetchProviders = async (
  API_BASE_URL: string,
  setIsLoading: (loading: boolean) => void,
  setElectricityProviders: (providers: any[]) => void,
  retryCount = 0
): Promise<void> => {
  try {
    console.log(`🔄 Fetching providers... (attempt ${retryCount + 1})`);
    setIsLoading(true);
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_BASE_URL}/providers`, {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    
    console.log('📥 Providers response status:', response.status);
    
    if (!response.ok) {
      console.log('❌ HTTP error:', response.status, response.statusText);
      if (retryCount < 2) {
        console.log(`🔄 Retrying... (${retryCount + 1}/3)`);
        setTimeout(() => fetchProviders(API_BASE_URL, setIsLoading, setElectricityProviders, retryCount + 1), 1000);
        return;
      }
      setElectricityProviders([]);
      return;
    }
    
    const data = await response.json();
    console.log('📥 Providers response data:', data);
    
    if (data.success) {
      const providers = data.data || [];
      setElectricityProviders(providers);
      console.log('✅ Providers loaded from database:', providers.length);
      console.log('📋 Provider names:', providers.map((p: any) => p.name));
      console.log('📋 Provider IDs:', providers.map((p: any) => p._id));
      console.log('📋 isActive status:', providers.map((p: any) => p.isActive));
    } else {
      console.log('❌ Failed to load providers from database:', data.error);
      if (retryCount < 2) {
        console.log(`🔄 Retrying... (${retryCount + 1}/3)`);
        setTimeout(() => fetchProviders(API_BASE_URL, setIsLoading, setElectricityProviders, retryCount + 1), 1000);
        return;
      }
      setElectricityProviders([]);
    }
  } catch (error) {
    console.log('❌ Failed to fetch providers from database:', error);
    if (error instanceof Error) {
      console.log('❌ Error message:', error.message);
      if (error.name === 'AbortError') {
        console.log('❌ Request timed out');
      }
    }
    
    if (retryCount < 2) {
      console.log(`🔄 Retrying... (${retryCount + 1}/3)`);
      setTimeout(() => fetchProviders(API_BASE_URL, setIsLoading, setElectricityProviders, retryCount + 1), 1000);
      return;
    }
    
    setElectricityProviders([]);
  } finally {
    setIsLoading(false);
  }
};

// Create a new purchase
export const createPurchase = async (
  API_BASE_URL: string,
  providerId: string,
  amount: number,
  cost: number
): Promise<any> => {
  try {
    const purchaseData = {
      userId: 'user123', // You can make this dynamic
      providerId: providerId,
      amount: amount,
      paymentMethod: 'credit_card',
      notes: 'Purchase from mobile app'
    };

    const response = await fetch(`${API_BASE_URL}/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(purchaseData),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Purchase saved to database:', data.data);
      return data.data;
    } else {
      console.log('❌ Failed to save purchase:', data.error);
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log('❌ API error during purchase:', error.message);
    } else {
      console.log('❌ API error during purchase:', error);
    }
    return null;
  }
};

// Fetch user purchases
export const fetchUserPurchases = async (
  API_BASE_URL: string,
  setUserPurchases: (purchases: any[]) => void
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/purchases/user123`);
    const data = await response.json();
    
    if (data.success) {
      setUserPurchases(data.data);
      console.log('✅ User purchases loaded:', data.data.length);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log('❌ Failed to fetch user purchases:', error.message);
    } else {
      console.log('❌ Failed to fetch user purchases:', error);
    }
  }
};

// Create a new provider
export const createProvider = async (
  API_BASE_URL: string,
  providerData: any,
  refreshCallback: () => Promise<void>
): Promise<any> => {
  try {
    console.log('📤 Creating provider with data:', providerData);
    console.log('🌐 API URL:', `${API_BASE_URL}/providers`);
    
    const response = await fetch(`${API_BASE_URL}/providers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(providerData),
    });

    console.log('📥 Response status:', response.status);
    const data = await response.json();
    console.log('📥 Response data:', data);
    
    if (data.success) {
      console.log('✅ Provider created:', data.data);
      await refreshCallback(); // Refresh the list
      return data.data;
    } else {
      console.log('❌ Failed to create provider:', data.error);
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log('❌ API error during provider creation:', error.message);
    } else {
      console.log('❌ API error during provider creation:', error);
    }
    return null;
  }
};

// Update an existing provider
export const updateProvider = async (
  API_BASE_URL: string,
  providerId: string,
  providerData: any,
  refreshCallback: () => Promise<void>
): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/providers/${providerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(providerData),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Provider updated:', data.data);
      await refreshCallback(); // Refresh the list
      return data.data;
    } else {
      console.log('❌ Failed to update provider:', data.error);
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log('❌ API error during provider update:', error.message);
    } else {
      console.log('❌ API error during provider update:', error);
    }
    return null;
  }
};

// Delete a provider
export const deleteProvider = async (
  API_BASE_URL: string,
  providerId: string
): Promise<boolean> => {
  try {
    const url = `${API_BASE_URL}/providers/${providerId}`;
    console.log('🗑️ [deleteProvider] Sending DELETE request to:', url);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('📥 [deleteProvider] Response status:', response.status, response.statusText);
    const data = await response.json().catch(() => null);
    console.log('📥 [deleteProvider] Response body:', data);
    if (!response.ok) {
      console.log('❌ [deleteProvider] Delete failed:', response.status, response.statusText);
      return false;
    }
    if (data && data.success) {
      console.log('✅ [deleteProvider] Provider deleted successfully');
      return true;
    } else {
      console.log('❌ [deleteProvider] Delete failed:', data?.error);
      return false;
    }
  } catch (error) {
    console.log('❌ [deleteProvider] Error:', error);
    return false;
  }
};
