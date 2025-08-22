// ============================================================================
// POWERGRID MARKETPLACE - MAIN APPLICATION COMPONENT
// ============================================================================
// This is the main component that handles the entire marketplace application
// including user authentication, provider management, and purchase functionality

// Import icons for the UI (battery, solar, etc.)
import { Ionicons } from '@expo/vector-icons';

// Import Expo constants to access app configuration (like API URLs)
import Constants from 'expo-constants';

// Import React hooks for state management and side effects
import React, { useEffect, useState } from 'react';

// Import React Native components for building the mobile app
import {
  Alert, // For showing popup alerts and confirmations
  Dimensions, // For getting screen dimensions (width, height)
  Modal, // For showing modal dialogs (popup forms)
  Platform, // For platform-specific code (iOS/Android/Web)
  SafeAreaView, // For safe area on different devices (notches, etc.)
  ScrollView, // For scrollable content areas
  StatusBar, // For status bar styling
  StyleSheet, // For CSS-like styling
  Text, // For displaying text
  TextInput, // For input fields (forms)
  TouchableOpacity, // For touchable buttons
  View // For container views (like div in web)
} from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, PinchGestureHandler, State, TapGestureHandler } from 'react-native-gesture-handler';

// ============================================================================
// API CONFIGURATION
// ============================================================================
// This section configures how the app connects to the backend server
// The API_ORIGIN is read from app.json configuration (set to your ngrok URL)

// Get the API origin from app configuration (set in app.json)
// In production, this would be your actual server URL
// Fallback to localhost if no configuration is found
const API_ORIGIN = (Constants?.expoConfig?.extra as any)?.API_ORIGIN || 'http://localhost:3000';

// Build the full API URL for marketplace endpoints
// This creates: https://your-ngrok-url.ngrok-free.app/api/marketplace
const API_BASE_URL = `${API_ORIGIN}/api/marketplace`;

// ============================================================================
// DEBUG AND CONFIGURATION
// ============================================================================
// This section helps developers understand the current API configuration
// and provides useful debugging information

// Log API configuration to console for debugging
// Shows the current API URL and whether it's localhost or external
console.log('🔧 API Configuration:', {
  API_BASE_URL,
  isLocalhost: API_BASE_URL.includes('localhost'),
  port: API_BASE_URL.split(':')[2]?.split('/')[0]
});

// Get screen dimensions for responsive design
// width and height can be used to adjust layouts for different screen sizes
const { width, height } = Dimensions.get('window');

// ============================================================================
// MOCK USER DATA (FOR DEMONSTRATION)
// ============================================================================
// This is sample user data that would normally come from a database
// In a real app, this would be fetched from your backend server

const userData = {
  name: 'Johnson Legend',
  monthlyUsage: 450,
  averageCost: 54.00,
  totalConsumption: 5400,
  savings: 12.50,
  carbonFootprint: 2.1,
  currentProvider: 'Solar Power Co',
  monthlyBill: 54.00,
  lastPayment: '2024-01-15',
  nextPayment: '2024-02-15',
};

// ============================================================================
// MAIN COMPONENT: Index
// ============================================================================
// This is the main component that renders the entire marketplace application
// It manages all the state and renders different views based on user interaction

export default function Index() {
  // ============================================================================
  // STATE VARIABLES - CORE APPLICATION DATA
  // ============================================================================
  
  // Tab Navigation - controls which main section is displayed
  const [activeTab, setActiveTab] = useState('marketplace'); // 'marketplace', 'storage', or 'personal'
  
  // Storage Calculator - for calculating energy storage costs
  const [storageCapacity, setStorageCapacity] = useState(''); // User input for storage capacity
  const [dailyUsage, setDailyUsage] = useState(''); // User input for daily energy usage
  
  // Purchase System - handles buying electricity from providers
  const [selectedProvider, setSelectedProvider] = useState<any>(null); // Currently selected provider to buy from
  const [showProviderModal, setShowProviderModal] = useState(false); // Controls purchase modal visibility
  const [purchaseAmount, setPurchaseAmount] = useState(''); // Amount of electricity user wants to buy
  
  // User Data - tracks user's purchases and balance
  const [userPurchases, setUserPurchases] = useState<any[]>([]); // List of user's purchase history
  const [userBalance, setUserBalance] = useState(0); // User's current electricity balance
  
  // ============================================================================
  // API INTEGRATION STATE
  // ============================================================================
  // These states manage communication with the backend server
  
  const [electricityProviders, setElectricityProviders] = useState<any[]>([]); // All providers from database
  const [isLoading, setIsLoading] = useState(false); // Shows loading indicators during API calls
  const [apiStatus, setApiStatus] = useState('disconnected'); // Connection status to backend
  
  // ============================================================================
  // ADMIN MODE STATE
  // ============================================================================
  // These states control admin functionality for managing providers
  
  const [isAdminMode, setIsAdminMode] = useState(false); // Whether user is in admin mode
  const [showAddProviderModal, setShowAddProviderModal] = useState(false); // Controls add provider modal
  const [showEditProviderModal, setShowEditProviderModal] = useState(false); // Controls edit provider modal
  const [editingProvider, setEditingProvider] = useState<any>(null); // Provider being edited
  const [deletingProviderId, setDeletingProviderId] = useState<string | null>(null); // ID of provider being deleted
  
  // Admin Provider Form - for adding new providers
  const [newProvider, setNewProvider] = useState({
    name: '',           // Provider company name
    type: 'Solar',      // Type of energy (Solar, Wind, etc.)
    price: '',          // Price per kWh
    rating: '',         // Provider rating (0-5)
    available: '',      // Available capacity in kWh
    description: '',    // Provider description
    location: '',       // Provider location
    contactEmail: '',   // Contact email
    contactPhone: ''    // Contact phone
  });
  
  // Web Delete Confirmation - custom modal for web delete confirmation (since Alert doesn't work on web)
  const [webDeleteConfirm, setWebDeleteConfirm] = useState<{ visible: boolean; provider: any | null }>({ visible: false, provider: null });

  // ============================================================================
  // USER AUTHENTICATION STATE
  // ============================================================================
  // These states manage user login and authentication
  
  // Login Form - stores username, password, and any login errors
  const [loginState, setLoginState] = useState({ 
    username: '',    // User's username input
    password: '',    // User's password input
    error: ''        // Any login error messages
  });
  
  // User Type - tracks whether user is logged in as admin, regular user, or not logged in
  const [loggedInUser, setLoggedInUser] = useState<'admin' | 'user' | null>(null);
  
  // ============================================================================
  // USER PROVIDER REGISTRATION STATE
  // ============================================================================
  // These states allow regular users to register as electricity providers
  
  // User Provider Status - tracks if the current user is registered as a provider
  const [userProviderStatus, setUserProviderStatus] = useState<any>(null);
  
  // Become Provider Modal - controls the modal for user provider registration
  const [showBecomeProviderModal, setShowBecomeProviderModal] = useState(false);
  
  // User Provider Form - form data for user to register as provider
  const [userProviderForm, setUserProviderForm] = useState({
    name: '',           // Provider company name
    type: 'Solar',      // Type of energy (Solar, Wind, etc.)
    price: '',          // Price per kWh
    rating: '4.0',      // Provider rating (default 4.0)
    available: '',      // Available capacity in kWh
    description: '',    // Provider description
    location: '',       // Provider location
    contactEmail: '',   // Contact email (auto-filled with user's email)
    contactPhone: ''    // Contact phone number
  });
  // User form validation errors
  const [userFormErrors, setUserFormErrors] = useState<{[key: string]: string}>({});

  // Admin provider form state
  const [providerForm, setProviderForm] = useState({
    name: '',
    type: 'Solar',
    price: '',
    rating: '4.0',
    available: '',
    description: '',
    location: '',
    contactEmail: '',
    contactPhone: ''
  });
  // Admin form validation errors
  const [adminFormErrors, setAdminFormErrors] = useState<{[key: string]: string}>({});

  // Login handler
  const handleLogin = () => {
    if (loginState.username === 'admin' && loginState.password === 'admin123') {
      setLoggedInUser('admin');
      setIsAdminMode(true);
      setLoginState({ username: '', password: '', error: '' });
    } else if (loginState.username === 'user' && loginState.password === 'user123') {
      setLoggedInUser('user');
      setIsAdminMode(false);
      setLoginState({ username: '', password: '', error: '' });
    } else {
      setLoginState({ ...loginState, error: 'Invalid username or password' });
    }
  };

  // Logout handler
  const handleLogout = () => {
    setLoggedInUser(null);
    setIsAdminMode(false);
  };

  // API Functions
  const checkApiConnection = async () => {
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

  const fetchProviders = async (retryCount = 0) => {
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
          setTimeout(() => fetchProviders(retryCount + 1), 1000);
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
          setTimeout(() => fetchProviders(retryCount + 1), 1000);
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
        setTimeout(() => fetchProviders(retryCount + 1), 1000);
        return;
      }
      
      setElectricityProviders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createPurchase = async (providerId: string, amount: number, cost: number) => {
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

  const fetchUserPurchases = async () => {
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

  // CRUD Functions for Providers
  const createProvider = async (providerData: any) => {
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
        await fetchProviders(); // Refresh the list
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

  const updateProvider = async (providerId: string, providerData: any) => {
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
        await fetchProviders(); // Refresh the list
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

  const deleteProvider = async (providerId: string) => {
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

  // ============================================================================
  // MULTITOUCH GESTURE HANDLERS
  // ============================================================================
  // These functions handle advanced touch gestures for enhanced user experience
  
  // Advanced zoom state for flexible scaling
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [lastPanOffset, setLastPanOffset] = useState({ x: 0, y: 0 });
  
  // Two-finger tap handler for quick zoom presets
  const onTwoFingerTap = (event: any) => {
    if (event.nativeEvent.numberOfPointers === 2) {
      console.log('🔍 Two-finger tap detected - cycling through zoom levels');
      
      // Cycle through zoom levels: 1x → 1.5x → 2x → 1x (limited to 2.5x max)
      if (zoomLevel === 1) {
        setZoomLevel(1.5);
        setIsZoomed(true);
        console.log('🔍 Zoomed to 1.5x');
      } else if (zoomLevel === 1.5) {
        setZoomLevel(2);
        setIsZoomed(true);
        console.log('🔍 Zoomed to 2x');
      } else {
        setZoomLevel(1);
        setIsZoomed(false);
        setPanOffset({ x: 0, y: 0 }); // Reset pan when returning to normal
        setLastPanOffset({ x: 0, y: 0 });
        console.log('🔍 Reset to normal size');
      }
    }
  };
  
  // Pinch gesture handler for smooth zooming
  const onPinchGestureEvent = (event: any) => {
    const scale = event.nativeEvent.scale;
    // Use a more responsive scale factor for smoother zooming
    const scaleFactor = 1 + (scale - 1) * 0.3; // Further reduce sensitivity
    const newZoomLevel = Math.max(0.8, Math.min(2.5, zoomLevel * scaleFactor)); // Limit max zoom to 2.5x
    
    if (Math.abs(newZoomLevel - zoomLevel) > 0.01) { // Only update if change is significant
      setZoomLevel(newZoomLevel);
      setIsZoomed(newZoomLevel > 1);
      
      // Reset pan if zooming out to normal
      if (newZoomLevel <= 1) {
        setPanOffset({ x: 0, y: 0 });
        setLastPanOffset({ x: 0, y: 0 });
      }
    }
  };
  
  // Pull-to-refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshOffset, setRefreshOffset] = useState(0);
  
  // Pan gesture handler for moving around when zoomed
  const onPanGestureEvent = (event: any) => {
    if (zoomLevel > 1) {
      // Handle panning when zoomed
      const newX = lastPanOffset.x + event.nativeEvent.translationX;
      const newY = lastPanOffset.y + event.nativeEvent.translationY;
      
      // Limit panning to prevent content from going too far off-screen
      const maxPanX = (zoomLevel - 1) * 80; // Reduce pan limits
      const maxPanY = (zoomLevel - 1) * 80;
      
      setPanOffset({
        x: Math.max(-maxPanX, Math.min(maxPanX, newX)),
        y: Math.max(-maxPanY, Math.min(maxPanY, newY))
      });
    }
  };
  
  // Separate handler for pull-to-refresh that doesn't interfere with scrolling
  const onPullToRefresh = (event: any) => {
    if (activeTab === 'marketplace' && event.nativeEvent.translationY > 0) {
      const pullDistance = Math.min(event.nativeEvent.translationY * 0.3, 80);
      setRefreshOffset(pullDistance);
    }
  };
  
  // Pan gesture state change handler
  const onPanStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      if (zoomLevel > 1) {
        setLastPanOffset(panOffset);
      } else if (activeTab === 'marketplace' && refreshOffset > 50) {
        // Trigger refresh if pulled down far enough
        handlePullToRefresh();
      }
      setRefreshOffset(0); // Reset refresh offset
    }
  };
  
  // Pull-to-refresh handler
  const handlePullToRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    console.log('🔄 Pull-to-refresh triggered');
    
    try {
      await fetchProviders();
      Alert.alert('Success', 'Marketplace refreshed!');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh marketplace');
    } finally {
      setIsRefreshing(false);
    }
  };
  

  
  // Reset zoom function
  const resetZoom = () => {
    setZoomLevel(1);
    setIsZoomed(false);
    setPanOffset({ x: 0, y: 0 });
    setLastPanOffset({ x: 0, y: 0 });
  };

  // Initialize API connection on component mount
  useEffect(() => {
    const initializeApp = async () => {
      const isConnected = await checkApiConnection();
      if (isConnected) {
        await fetchProviders();
        await fetchUserPurchases();
        if (loggedInUser === 'user') {
          await checkUserProviderStatus();
        }
      }
    };

    initializeApp();
  }, [loggedInUser]);

  const calculateStorageCost = () => {
    if (!storageCapacity || !dailyUsage) return null;
    
    const capacity = parseFloat(storageCapacity);
    const usage = parseFloat(dailyUsage);
    const costPerKWh = 0.25;
    const installationCost = 100;
    
    const batteryCost = capacity * costPerKWh;
    const totalCost = batteryCost + installationCost;
    const paybackYears = totalCost / (usage * 365 * 0.12);
    
    return {
      batteryCost: batteryCost.toFixed(2),
      installationCost: installationCost.toFixed(2),
      totalCost: totalCost.toFixed(2),
      paybackYears: paybackYears.toFixed(1),
      monthlySavings: (usage * 30 * 0.12).toFixed(2)
    };
  };

  const handlePurchase = async () => {
    // Check if user is logged in
    if (!loggedInUser) {
      Alert.alert(
        'Login Required',
        'Please log in to make purchases. You will be redirected to the login page.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Login', 
            onPress: () => setActiveTab('personal')
          }
        ]
      );
      return;
    }

    if (!selectedProvider || !purchaseAmount) {
      Alert.alert('Error', 'Please select a provider and enter purchase amount');
      return;
    }

    const amount = parseFloat(purchaseAmount);
    const cost = amount * selectedProvider.price;
    
    if (amount > selectedProvider.available) {
      Alert.alert('Error', 'Purchase amount exceeds available capacity');
      return;
    }

    // Try to save to database first
    let savedPurchase = null;
    if (apiStatus === 'connected') {
      savedPurchase = await createPurchase(selectedProvider._id || selectedProvider.id, amount, cost);
    }

    // Create local purchase object
    const purchase = {
      id: savedPurchase?._id || Date.now(),
      provider: selectedProvider.name,
      amount: amount,
      cost: cost,
      date: new Date().toLocaleDateString(),
      type: selectedProvider.type,
      status: savedPurchase ? 'completed' : 'local'
    };

    setUserPurchases([...userPurchases, purchase]);
    setUserBalance(userBalance + amount);
    setShowProviderModal(false);
    setPurchaseAmount('');
    setSelectedProvider(null);
    
    const message = savedPurchase 
      ? `Purchase saved to database! Transaction ID: ${savedPurchase.transactionId}`
      : `Purchase completed locally (database not available)`;
    
    Alert.alert('Purchase Successful!', message);
    
    // Refresh providers to update available capacity
    if (apiStatus === 'connected') {
      await fetchProviders();
    }
  };

  const storageCost = calculateStorageCost();

  // Storage tab calculator selection
  const [storageTab, setStorageTab] = useState<'storage' | 'solar'>('storage');
  // Solar panel calculator state
  const [solarDailyUsage, setSolarDailyUsage] = useState('');
  const [solarSunHours, setSolarSunHours] = useState('5');
  const [solarPanelCost, setSolarPanelCost] = useState('1200');
  const [solarInstallCost, setSolarInstallCost] = useState('2000');

  // Solar panel calculation logic
  const calculateSolarPanel = () => {
    if (!solarDailyUsage || !solarSunHours || !solarPanelCost || !solarInstallCost) return null;
    const usage = parseFloat(solarDailyUsage);
    const sunHours = parseFloat(solarSunHours);
    const panelCost = parseFloat(solarPanelCost);
    const installCost = parseFloat(solarInstallCost);
    const systemSize = usage / sunHours; // kW needed
    const totalCost = systemSize * panelCost + installCost;
    const monthlySavings = usage * 30 * 0.12; // $0.12/kWh
    const paybackYears = totalCost / (monthlySavings * 12 / 12);
    const co2Saved = usage * 365 * 0.0007; // tons/year (approx)
    return {
      systemSize: systemSize.toFixed(2),
      totalCost: totalCost.toFixed(2),
      monthlySavings: monthlySavings.toFixed(2),
      paybackYears: paybackYears.toFixed(1),
      co2Saved: co2Saved.toFixed(2)
    };
  };
  const solarResult = calculateSolarPanel();

  // CRUD Handler Functions
  const handleAddProvider = async () => {
    if (!validateAdminForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    const providerData = {
      ...providerForm,
      price: parseFloat(providerForm.price),
      rating: parseFloat(providerForm.rating) || 0,
      available: parseFloat(providerForm.available) || 0
    };

    console.log('📤 Sending provider data:', providerData);
    
    try {
      const result = await createProvider(providerData);
      
      if (result) {
        console.log('✅ Provider added successfully:', result);
        Alert.alert('Success', 'Provider added successfully!');
        setShowAddProviderModal(false);
        setProviderForm({
          name: '',
          type: 'Solar',
          price: '',
          rating: '4.0',
          available: '',
          description: '',
          location: '',
          contactEmail: '',
          contactPhone: ''
        });
        if (adminFormErrors.name) {
          setAdminFormErrors({...adminFormErrors, name: ''});
        }
        if (adminFormErrors.price) {
          setAdminFormErrors({...adminFormErrors, price: ''});
        }
        if (adminFormErrors.description) {
          setAdminFormErrors({...adminFormErrors, description: ''});
        }
        if (adminFormErrors.location) {
          setAdminFormErrors({...adminFormErrors, location: ''});
        }
        if (adminFormErrors.contactEmail) {
          setAdminFormErrors({...adminFormErrors, contactEmail: ''});
        }
        if (adminFormErrors.contactPhone) {
          setAdminFormErrors({...adminFormErrors, contactPhone: ''});
        }
        await fetchProviders(); // Refresh provider list
      } else {
        console.log('❌ Failed to add provider');
        Alert.alert('Error', 'Failed to add provider. Please check your connection and try again.');
      }
    } catch (error) {
      console.log('❌ Error in handleAddProvider:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to add provider: ${errorMessage}`);
    }
  };

  const handleEditProvider = async () => {
    console.log('🔄 Updating provider...', editingProvider);
    
    if (!editingProvider || !editingProvider.name || !editingProvider.price || !editingProvider.description) {
      Alert.alert('Error', 'Please fill in all required fields (Name, Price, Description)');
      return;
    }

    const providerData = {
      ...editingProvider,
      price: parseFloat(editingProvider.price),
      rating: parseFloat(editingProvider.rating) || 0,
      available: parseFloat(editingProvider.available) || 0
    };

    console.log('📤 Sending update data:', providerData);
    
    try {
      const result = await updateProvider(editingProvider._id, providerData);
      
      if (result) {
        console.log('✅ Provider updated successfully:', result);
        Alert.alert('Success', 'Provider updated successfully!');
        setShowEditProviderModal(false);
        setEditingProvider(null);
      } else {
        console.log('❌ Failed to update provider');
        Alert.alert('Error', 'Failed to update provider. Please check your connection and try again.');
      }
    } catch (error) {
      console.log('❌ Error in handleEditProvider:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to update provider: ${errorMessage}`);
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    if (!providerId) {
      Alert.alert('Error', 'Provider ID not found. Cannot delete.');
      return;
    }
    setDeletingProviderId(providerId);
    console.log('🗑️ [handleDeleteProvider] Attempting to delete provider with ID:', providerId);
    try {
      const success = await deleteProvider(providerId);
      console.log('🗑️ [handleDeleteProvider] deleteProvider returned:', success);
      if (success) {
        setElectricityProviders(prevProviders => 
          prevProviders.filter(p => p._id !== providerId)
        );
        Alert.alert('Success', 'Provider deleted successfully!');
      } else {
        Alert.alert('Error', 'Failed to delete provider. Please try again.');
      }
    } catch (error) {
      console.log('❌ [handleDeleteProvider] Error:', error);
      Alert.alert('Error', 'Failed to delete provider. Please try again.');
    } finally {
      setDeletingProviderId(null);
    }
  };

  const confirmDeleteProvider = (provider: any) => {
    if (Platform.OS === 'web') {
      setWebDeleteConfirm({ visible: true, provider });
    } else {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${provider.name}"?\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
            onPress: () => handleDeleteProvider(provider._id)
        }
      ]
    );
    }
  };

  const openEditModal = (provider: any) => {
    setEditingProvider({
      ...provider,
      price: provider.price.toString(),
      rating: provider.rating.toString(),
      available: provider.available.toString()
    });
    setShowEditProviderModal(true);
  };

  const renderStorageCalculator = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Info Card and Segmented Control */}
      <View style={styles.infoCard}>
        <Ionicons name="battery-charging" size={36} color="#2E7D32" style={{ marginBottom: 8 }} />
        <Text style={styles.infoTitle}>Energy Solutions</Text>
        <Text style={styles.infoSubtitle}>Estimate your savings and payback for storing or generating your own electricity.</Text>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segmentButton, storageTab === 'storage' && styles.segmentButtonActive]}
            onPress={() => setStorageTab('storage')}
          >
            <Text style={[styles.segmentText, storageTab === 'storage' && styles.segmentTextActive]}>Storage System</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentButton, storageTab === 'solar' && styles.segmentButtonActive]}
            onPress={() => setStorageTab('solar')}
          >
            <Text style={[styles.segmentText, storageTab === 'solar' && styles.segmentTextActive]}>Solar Panel</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Storage System Calculator */}
      {storageTab === 'storage' && (
      <View style={styles.calculatorCard}>
          <Text style={styles.sectionTitle}>Storage System Calculator</Text>
          <Text style={styles.sectionSubtitle}>Calculate the cost and payback of storing your excess electricity.</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Storage Capacity (kWh)</Text>
          <TextInput
            style={styles.input}
            value={storageCapacity}
            onChangeText={setStorageCapacity}
            placeholder="Enter capacity (e.g., 10)"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Daily Usage (kWh)</Text>
          <TextInput
            style={styles.input}
            value={dailyUsage}
            onChangeText={setDailyUsage}
            placeholder="Enter daily usage (e.g., 15)"
            keyboardType="numeric"
          />
        </View>
        {storageCost && (
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>Cost Breakdown</Text>
              <View style={styles.resultRow}><Text style={styles.resultLabel}>Battery Cost:</Text><Text style={styles.resultValue}>${storageCost.batteryCost}</Text></View>
              <View style={styles.resultRow}><Text style={styles.resultLabel}>Installation:</Text><Text style={styles.resultValue}>${storageCost.installationCost}</Text></View>
              <View style={styles.resultRow}><Text style={styles.resultLabel}>Total Cost:</Text><Text style={[styles.resultValue, styles.totalCost]}>${storageCost.totalCost}</Text></View>
              <View style={styles.resultRow}><Text style={styles.resultLabel}>Payback Period:</Text><Text style={styles.resultValue}>{storageCost.paybackYears} years</Text></View>
              <View style={styles.resultRow}><Text style={styles.resultLabel}>Monthly Savings:</Text><Text style={styles.resultValue}>${storageCost.monthlySavings}</Text></View>
              {/* Visual bar for cost breakdown */}
              <View style={{ flexDirection: 'row', marginTop: 12, alignItems: 'center' }}>
                <View style={{ height: 12, width: `${(parseFloat(storageCost.batteryCost) / parseFloat(storageCost.totalCost)) * 100}%`, backgroundColor: '#2E7D32', borderRadius: 6 }} />
                <View style={{ height: 12, width: `${(parseFloat(storageCost.installationCost) / parseFloat(storageCost.totalCost)) * 100}%`, backgroundColor: '#FF9800', borderRadius: 6, marginLeft: 2 }} />
            </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
                <Text style={{ fontSize: 10, color: '#2E7D32' }}>Battery</Text>
                <Text style={{ fontSize: 10, color: '#FF9800' }}>Install</Text>
            </View>
          </View>
        )}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            if (storageCost) {
              Alert.alert(
                'Storage Quote', 
                `Total cost: $${storageCost.totalCost}\nPayback: ${storageCost.paybackYears} years\nWould you like to proceed?`
              );
            }
          }}
        >
          <Text style={styles.actionButtonText}>Get Quote</Text>
        </TouchableOpacity>
          <View style={styles.tipsCard}>
            <Ionicons name="information-circle" size={20} color="#2E7D32" style={{ marginRight: 6 }} />
            <Text style={styles.tipsText}>Storing excess electricity lets you use your own power at night or during outages, and can reduce your bills.</Text>
          </View>
        </View>
      )}
      {/* Solar Panel Calculator */}
      {storageTab === 'solar' && (
        <View style={styles.calculatorCard}>
          <Text style={styles.sectionTitle}>Solar Panel Calculator</Text>
          <Text style={styles.sectionSubtitle}>Estimate the cost and benefits of installing solar panels at your home.</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Daily Usage (kWh)</Text>
            <TextInput
              style={styles.input}
              value={solarDailyUsage}
              onChangeText={setSolarDailyUsage}
              placeholder="Enter daily usage (e.g., 15)"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Average Sun Hours/Day</Text>
            <TextInput
              style={styles.input}
              value={solarSunHours}
              onChangeText={setSolarSunHours}
              placeholder="e.g., 5"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Panel Cost per kW ($)</Text>
            <TextInput
              style={styles.input}
              value={solarPanelCost}
              onChangeText={setSolarPanelCost}
              placeholder="e.g., 1200"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Installation Cost ($)</Text>
            <TextInput
              style={styles.input}
              value={solarInstallCost}
              onChangeText={setSolarInstallCost}
              placeholder="e.g., 2000"
              keyboardType="numeric"
            />
          </View>
          {solarResult && (
            <View style={styles.resultsCard}>
              <Text style={styles.resultsTitle}>Solar System Estimate</Text>
              <View style={styles.resultRow}><Text style={styles.resultLabel}>System Size Needed:</Text><Text style={styles.resultValue}>{solarResult.systemSize} kW</Text></View>
              <View style={styles.resultRow}><Text style={styles.resultLabel}>Total Cost:</Text><Text style={[styles.resultValue, styles.totalCost]}>${solarResult.totalCost}</Text></View>
              <View style={styles.resultRow}><Text style={styles.resultLabel}>Monthly Savings:</Text><Text style={styles.resultValue}>${solarResult.monthlySavings}</Text></View>
              <View style={styles.resultRow}><Text style={styles.resultLabel}>Payback Period:</Text><Text style={styles.resultValue}>{solarResult.paybackYears} years</Text></View>
              <View style={styles.resultRow}><Text style={styles.resultLabel}>CO₂ Saved:</Text><Text style={styles.resultValue}>{solarResult.co2Saved} tons/year</Text></View>
            </View>
          )}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              if (solarResult) {
                Alert.alert(
                  'Solar Quote', 
                  `Total cost: $${solarResult.totalCost}\nPayback: ${solarResult.paybackYears} years\nWould you like to proceed?`
                );
              }
            }}
          >
            <Text style={styles.actionButtonText}>Get Solar Quote</Text>
          </TouchableOpacity>
          <View style={styles.tipsCard}>
            <Ionicons name="sunny" size={20} color="#FF9800" style={{ marginRight: 6 }} />
            <Text style={styles.tipsText}>Solar panels can lower your bills, increase your home's value, and help the environment by reducing carbon emissions.</Text>
          </View>
        </View>
      )}
      {/* FAQ/Info Section */}
      <View style={styles.faqCard}>
        <Text style={styles.faqTitle}>Why consider energy storage or solar?</Text>
        <Text style={styles.faqText}>• Store excess energy for use at night or during outages. {'\n'}• Reduce your electricity bills and reliance on the grid. {'\n'}• Solar panels generate clean, renewable energy and can pay for themselves over time.</Text>
      </View>
    </ScrollView>
  );

  const renderMarketplace = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Pull-to-refresh indicator */}
      {refreshOffset > 0 && (
        <View style={[styles.pullToRefreshIndicator, { transform: [{ translateY: refreshOffset }] }]}>
          <Ionicons 
            name={refreshOffset > 50 ? "checkmark-circle" : "arrow-down"} 
            size={20} 
            color={refreshOffset > 50 ? "#4CAF50" : "#666"} 
          />
          <Text style={styles.pullToRefreshText}>
            {refreshOffset > 50 ? "Release to refresh" : "Pull down to refresh"}
          </Text>
        </View>
      )}
      
      <View style={styles.marketplaceHeader}>
        <Text style={styles.sectionTitle}>Electricity Marketplace</Text>
        <Text style={styles.subtitle}>Buy and sell electricity P2P</Text>
        
        {/* API Status Indicator */}
        <View style={[styles.statusIndicator, { backgroundColor: apiStatus === 'connected' ? '#4CAF50' : '#FF9800' }]}>
          <Text style={styles.statusText}>
            {apiStatus === 'connected' ? '🟢 Connected to Database' : '🟡 Database Not Available'}
          </Text>
        </View>
        

        
        
        

        
        {userBalance > 0 && (
          <View style={styles.balanceCard}>
            <Text style={styles.balanceTitle}>Your Balance</Text>
            <Text style={styles.balanceAmount}>{userBalance.toFixed(2)} kWh</Text>
          </View>
        )}
      </View>
      
      {isLoading ? (
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>Loading providers...</Text>
        </View>
      ) : electricityProviders.length > 0 ? (
        electricityProviders.map((provider, index) => (
          <View key={provider._id || provider.id || `${provider.name}-${index}`} style={styles.providerCard}>
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{provider.name}</Text>
              <Text style={styles.providerType}>{provider.type} Energy</Text>
              <Text style={styles.providerDescription}>{provider.description}</Text>
              <View style={styles.providerStats}>
                <Text style={styles.price}>${provider.price}/kWh</Text>
                <Text style={styles.rating}>⭐ {provider.rating}</Text>
              </View>
            </View>
            <View style={styles.providerActions}>
              <Text style={styles.available}>{provider.available} kWh available</Text>
              {isAdminMode ? (
                <View style={styles.adminActions}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => openEditModal(provider)}
                    disabled={deletingProviderId === provider._id}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.deleteButton,
                      deletingProviderId === provider._id && styles.deleteButtonLoading
                    ]}
                    onPress={() => confirmDeleteProvider(provider)}
                    disabled={deletingProviderId === provider._id}
                  >
                    <Text style={styles.deleteButtonText}>
                      {deletingProviderId === provider._id ? 'Deleting...' : 'Delete'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                                  // Check if this is the user's own provider
                  (() => {
                    // More robust check for user's own provider
                    const isOwnProvider = loggedInUser === 'user' && 
                      userProviderStatus && 
                      (
                        provider._id === userProviderStatus._id || // Exact ID match
                        (provider.userId === 'user123' && userProviderStatus.userId === 'user123') || // User ID match
                        (provider.contactEmail === 'user@example.com' && userProviderStatus.contactEmail === 'user@example.com') // Email match
                      );
                  
                  if (isOwnProvider) {
                    return (
                      <View style={styles.ownProviderIndicator}>
                        <Ionicons name="person" size={16} color="#666" />
                        <Text style={styles.ownProviderText}>Your Provider</Text>
                      </View>
                    );
                  }
                  
                  return loggedInUser ? (
                <TouchableOpacity 
                  style={styles.buyButton}
                  onPress={() => {
                    setSelectedProvider(provider);
                    setShowProviderModal(true);
                  }}
                >
                  <Text style={styles.buyButtonText}>Buy</Text>
                </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.buyButton, { backgroundColor: '#ccc' }]}
                      onPress={() => {
                        Alert.alert(
                          'Login Required',
                          'Please log in to make purchases. You will be redirected to the login page.',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { 
                              text: 'Login', 
                              onPress: () => setActiveTab('personal')
                            }
                          ]
                        );
                      }}
                    >
                      <Text style={[styles.buyButtonText, { color: '#666' }]}>Login to Buy</Text>
                    </TouchableOpacity>
                  );
                })()
              )}
            </View>
          </View>
        ))
      ) : (
        <View style={styles.noDataCard}>
          <Text style={styles.noDataTitle}>No Providers Available</Text>
          <Text style={styles.noDataText}>
            {apiStatus === 'connected' 
              ? 'No electricity providers found in the database. Please check back later.'
              : 'Database connection required. Please start the server to view providers.'
            }
          </Text>
          {apiStatus === 'disconnected' && (
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={async () => {
                const isConnected = await checkApiConnection();
                if (isConnected) {
                  await fetchProviders();
                }
              }}
            >
              <Text style={styles.retryButtonText}>Retry Connection</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Add Provider Button (Admin Mode) */}
      {isAdminMode && apiStatus === 'connected' && (
        <TouchableOpacity 
          style={styles.addProviderButton}
          onPress={() => setShowAddProviderModal(true)}
        >
          <Text style={styles.addProviderButtonText}>➕ Add New Provider</Text>
        </TouchableOpacity>
      )}

      {userPurchases.length > 0 && (
        <View style={styles.purchasesCard}>
          <Text style={styles.purchasesTitle}>Recent Purchases</Text>
          {userPurchases.slice(-3).map((purchase, idx) => (
            <View key={purchase.id || purchase._id || `purchase-${idx}`} style={styles.purchaseItem}>
              <Text style={styles.purchaseProvider}>{purchase.provider}</Text>
              <Text style={styles.purchaseDetails}>
                {purchase.amount} kWh • ${purchase.cost.toFixed(2)} • {purchase.date}
                {purchase.status === 'local' && ' (Local)'}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  // Personal tab: show login if not logged in, else show dashboard or admin directions
  const renderPersonalData = () => {
    if (!loggedInUser) {
      return (
        <View style={styles.personalCard}>
          <Text style={styles.sectionTitle}>Login</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={loginState.username}
              onChangeText={text => setLoginState({ ...loginState, username: text })}
              placeholder="Enter username"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={loginState.password}
              onChangeText={text => setLoginState({ ...loginState, password: text })}
              placeholder="Enter password"
              secureTextEntry
            />
          </View>
          {loginState.error ? (
            <Text style={{ color: 'red', marginBottom: 10 }}>{loginState.error}</Text>
          ) : null}
          <TouchableOpacity style={styles.actionButton} onPress={handleLogin}>
            <Text style={styles.actionButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (loggedInUser === 'admin') {
      return (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
          {/* Admin Header */}
          <View style={styles.adminHeader}>
            <Ionicons name="shield-checkmark" size={32} color="#2E7D32" />
            <Text style={styles.adminTitle}>Admin Dashboard</Text>
            <Text style={styles.adminSubtitle}>Welcome back, Administrator!</Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="flash" size={24} color="#FF9800" />
              <Text style={styles.statNumber}>{electricityProviders.length}</Text>
              <Text style={styles.statLabel}>Active Providers</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="cart" size={24} color="#2196F3" />
              <Text style={styles.statNumber}>{userPurchases.length}</Text>
              <Text style={styles.statLabel}>Total Purchases</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trending-up" size={24} color="#4CAF50" />
              <Text style={styles.statNumber}>
                ${userPurchases.reduce((sum, p) => sum + p.cost, 0).toFixed(2)}
              </Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
          </View>

          {/* Admin Directions */}
          <View style={styles.adminDirections}>
            <Text style={styles.directionsTitle}>📋 Admin Actions</Text>
            <View style={styles.directionItem}>
              <Ionicons name="add-circle" size={20} color="#4CAF50" />
              <Text style={styles.directionText}>Add new providers in Marketplace tab</Text>
            </View>
            <View style={styles.directionItem}>
              <Ionicons name="create" size={20} color="#2196F3" />
              <Text style={styles.directionText}>Edit provider details and pricing</Text>
            </View>
            <View style={styles.directionItem}>
              <Ionicons name="trash" size={20} color="#F44336" />
              <Text style={styles.directionText}>Remove inactive providers</Text>
            </View>
            <View style={styles.directionItem}>
              <Ionicons name="refresh" size={20} color="#FF9800" />
              <Text style={styles.directionText}>Monitor purchase activity below</Text>
            </View>
          </View>

          {/* Active Providers Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="business" size={24} color="#2E7D32" />
              <Text style={styles.sectionTitle}>Active Providers</Text>
              <Text style={styles.sectionCount}>({electricityProviders.length})</Text>
            </View>
            {electricityProviders.length > 0 ? (
              electricityProviders.map((provider, index) => (
                <View key={provider._id || provider.id || `${provider.name}-${index}`} style={styles.providerListItem}>
                  <View style={styles.providerListInfo}>
                    <Text style={styles.providerListName}>{provider.name}</Text>
                    <Text style={styles.providerListType}>{provider.type} Energy</Text>
                    <Text style={styles.providerListPrice}>${provider.price}/kWh</Text>
                  </View>
                  <View style={styles.providerListStats}>
                    <Text style={styles.providerListRating}>⭐ {provider.rating}</Text>
                    <Text style={styles.providerListAvailable}>{provider.available} kWh</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="business-outline" size={48} color="#ccc" />
                <Text style={styles.emptyStateText}>No providers available</Text>
                <Text style={styles.emptyStateSubtext}>Add providers in the Marketplace tab</Text>
              </View>
            )}
          </View>

          {/* Purchase History Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="receipt" size={24} color="#2196F3" />
              <Text style={styles.sectionTitle}>Recent Purchases</Text>
              <Text style={styles.sectionCount}>({userPurchases.length})</Text>
            </View>
            {userPurchases.length > 0 ? (
              userPurchases.map((purchase, index) => (
                <View key={purchase.id || purchase._id || `purchase-${index}`} style={styles.purchaseListItem}>
                  <View style={styles.purchaseListInfo}>
                    <Text style={styles.purchaseListProvider}>{purchase.provider}</Text>
                    <Text style={styles.purchaseListDate}>{purchase.date}</Text>
                    <Text style={styles.purchaseListAmount}>{purchase.amount} kWh</Text>
                  </View>
                  <View style={styles.purchaseListStats}>
                    <Text style={styles.purchaseListCost}>${purchase.cost.toFixed(2)}</Text>
                    <Text style={styles.purchaseListStatus}>
                      {purchase.status === 'local' ? '🔄 Local' : '✅ Complete'}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color="#ccc" />
                <Text style={styles.emptyStateText}>No purchases yet</Text>
                <Text style={styles.emptyStateSubtext}>Purchases will appear here</Text>
              </View>
            )}
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.adminLogoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.adminLogoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }
    // If user
    return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.personalCard}>
        <Text style={styles.sectionTitle}>Personal Dashboard</Text>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userSubtitle}>Energy Consumer</Text>
          <Text style={styles.currentProvider}>Current: {userData.currentProvider}</Text>
        </View>
          
          {/* User Provider Status */}
          <View style={styles.providerStatusCard}>
            <Text style={styles.providerStatusTitle}>Provider Status</Text>
            {userProviderStatus ? (
              <View style={styles.providerStatusActive}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.providerStatusText}>You are registered as a provider</Text>
                <Text style={styles.providerStatusDetails}>
                  {userProviderStatus.name} • ${userProviderStatus.price}/kWh • {userProviderStatus.available} kWh available
                </Text>
                <TouchableOpacity 
                  style={styles.cancelProviderButton}
                  onPress={cancelProviderStatus}
                >
                  <Text style={styles.cancelProviderText}>Cancel Provider Status</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.providerStatusInactive}>
                <Ionicons name="add-circle-outline" size={24} color="#666" />
                <Text style={styles.providerStatusText}>You are not registered as a provider</Text>
                <TouchableOpacity 
                  style={styles.becomeProviderButton}
                  onPress={() => setShowBecomeProviderModal(true)}
                >
                  <Text style={styles.becomeProviderText}>Become a Provider</Text>
                </TouchableOpacity>
              </View>
            )}
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userData.monthlyUsage}</Text>
            <Text style={styles.statLabel}>Monthly Usage (kWh)</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${userData.averageCost}</Text>
            <Text style={styles.statLabel}>Average Monthly Cost</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userData.totalConsumption}</Text>
            <Text style={styles.statLabel}>Annual Consumption (kWh)</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${userData.savings}</Text>
            <Text style={styles.statLabel}>Monthly Savings</Text>
          </View>
        </View>

        <View style={styles.billingCard}>
          <Text style={styles.billingTitle}>Billing Information</Text>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Last Payment:</Text>
            <Text style={styles.billingValue}>{userData.lastPayment}</Text>
          </View>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Next Payment:</Text>
            <Text style={styles.billingValue}>{userData.nextPayment}</Text>
          </View>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Current Balance:</Text>
            <Text style={styles.billingValue}>${userData.monthlyBill}</Text>
          </View>
        </View>
        
        <View style={styles.consumptionChart}>
          <Text style={styles.chartTitle}>Monthly Consumption Trend</Text>
          <View style={styles.chartBars}>
            {[320, 380, 420, 390, 450, 480, 520, 490, 460, 430, 410, 450].map((value, index) => (
              <View key={index} style={styles.chartBar}>
                <View style={[styles.bar, { height: (value / 600) * 100 }]} />
                <Text style={styles.barLabel}>{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.carbonFootprint}>
          <Text style={styles.carbonTitle}>Carbon Footprint</Text>
          <Text style={styles.carbonValue}>{userData.carbonFootprint} tons CO2/year</Text>
          <Text style={styles.carbonSubtitle}>You are saving 0.8 tons compared to grid average</Text>
        </View>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => Alert.alert('Support', 'Contact customer service for assistance')}
        >
          <Text style={styles.actionButtonText}>Contact Support</Text>
          </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleLogout}
            >
              <Text style={styles.actionButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
  };

  // Check if user is already a provider
  const checkUserProviderStatus = async () => {
    try {
      // For now, we'll check if the user has a provider entry
      // In a real app, you'd have a user-provider relationship table
      const response = await fetch(`${API_BASE_URL}/providers`);
      const data = await response.json();
      
      if (data.success) {
        // Look for provider with user's email or specific user identifier
        const userProvider = data.data.find((p: any) => 
          p.contactEmail === 'user@example.com' || 
          p.userId === 'user123' ||  // In real app, use actual user ID
          (p.name && p.name.toLowerCase().includes('user'))
        );
        setUserProviderStatus(userProvider || null);
      }
    } catch (error) {
      console.log('❌ Failed to check user provider status:', error);
    }
  };

  // Register user as provider
  const registerAsProvider = async () => {
    if (!validateUserForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    const providerData = {
      ...userProviderForm,
      price: parseFloat(userProviderForm.price),
      rating: parseFloat(userProviderForm.rating) || 4.0,
      available: parseFloat(userProviderForm.available) || 0,
      contactEmail: 'user@example.com', // In real app, get from user profile
      userId: 'user123', // In real app, use actual user ID from auth
      isActive: true
    };

    try {
      const result = await createProvider(providerData);
      
      if (result) {
        console.log('✅ User registered as provider:', result);
        setUserProviderStatus(result);
        setShowBecomeProviderModal(false);
        setUserProviderForm({
          name: '',
          type: 'Solar',
          price: '',
          rating: '4.0',
          available: '',
          description: '',
          location: '',
          contactEmail: '',
          contactPhone: ''
        });
        if (userFormErrors.name) {
          setUserFormErrors({...userFormErrors, name: ''});
        }
        if (userFormErrors.price) {
          setUserFormErrors({...userFormErrors, price: ''});
        }
        if (userFormErrors.description) {
          setUserFormErrors({...userFormErrors, description: ''});
        }
        if (userFormErrors.location) {
          setUserFormErrors({...userFormErrors, location: ''});
        }
        if (userFormErrors.contactPhone) {
          setUserFormErrors({...userFormErrors, contactPhone: ''});
        }
        Alert.alert('Success', 'You are now registered as a provider!');
        await fetchProviders(); // Refresh provider list
      } else {
        Alert.alert('Error', 'Failed to register as provider. Please try again.');
      }
    } catch (error) {
      console.log('❌ Error registering as provider:', error);
      Alert.alert('Error', 'Failed to register as provider. Please try again.');
    }
  };

  // Cancel provider status
  const cancelProviderStatus = async () => {
    if (!userProviderStatus?._id) {
      Alert.alert('Error', 'Provider ID not found.');
      return;
    }

    Alert.alert(
      'Cancel Provider Status',
      'Are you sure you want to cancel your provider status? This will remove you from the marketplace.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteProvider(userProviderStatus._id);
              if (success) {
                setUserProviderStatus(null);
                Alert.alert('Success', 'Provider status cancelled successfully!');
                await fetchProviders(); // Refresh provider list
              } else {
                Alert.alert('Error', 'Failed to cancel provider status. Please try again.');
              }
            } catch (error) {
              console.log('❌ Error cancelling provider status:', error);
              Alert.alert('Error', 'Failed to cancel provider status. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Only allow digits for Australian phone numbers
    const phoneRegex = /^\d+$/;
    // Australian mobile numbers are 10 digits (04XX XXX XXX)
    // Australian landline numbers are 8 digits (XX XXXX XXXX)
    const digitCount = phone.length;
    return phoneRegex.test(phone) && (digitCount === 10 || digitCount === 8);
  };

  const validateTextOnly = (text: string): boolean => {
    const textRegex = /^[a-zA-Z\s\-\.]+$/;
    return textRegex.test(text) && text.trim().length > 0;
  };

  const validateDescription = (description: string): boolean => {
    return description.trim().length >= 10 && description.trim().length <= 500;
  };

  const validateAdminForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!providerForm.name.trim()) {
      errors.name = 'Provider name is required';
    } else if (!validateTextOnly(providerForm.name)) {
      errors.name = 'Name should contain only letters, spaces, hyphens, and periods';
    }
    
    if (!providerForm.price.trim()) {
      errors.price = 'Price is required';
    } else if (isNaN(parseFloat(providerForm.price)) || parseFloat(providerForm.price) <= 0) {
      errors.price = 'Price must be a positive number';
    }
    
    if (!providerForm.description.trim()) {
      errors.description = 'Description is required';
    } else if (!validateDescription(providerForm.description)) {
      errors.description = 'Description must be between 10 and 500 characters';
    }
    
    if (providerForm.location.trim() && !validateTextOnly(providerForm.location)) {
      errors.location = 'Location should contain only letters, spaces, hyphens, and periods';
    }
    
    if (providerForm.contactEmail.trim() && !validateEmail(providerForm.contactEmail)) {
      errors.contactEmail = 'Please enter a valid email address';
    }
    
    if (providerForm.contactPhone.trim() && !validatePhone(providerForm.contactPhone)) {
      errors.contactPhone = 'Phone must be 8 digits (landline) or 10 digits (mobile) - numbers only';
    }
    
    setAdminFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateUserForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!userProviderForm.name.trim()) {
      errors.name = 'Provider name is required';
    } else if (!validateTextOnly(userProviderForm.name)) {
      errors.name = 'Name should contain only letters, spaces, hyphens, and periods';
    }
    
    if (!userProviderForm.price.trim()) {
      errors.price = 'Price is required';
    } else if (isNaN(parseFloat(userProviderForm.price)) || parseFloat(userProviderForm.price) <= 0) {
      errors.price = 'Price must be a positive number';
    }
    
    if (!userProviderForm.description.trim()) {
      errors.description = 'Description is required';
    } else if (!validateDescription(userProviderForm.description)) {
      errors.description = 'Description must be between 10 and 500 characters';
    }
    
    if (userProviderForm.location.trim() && !validateTextOnly(userProviderForm.location)) {
      errors.location = 'Location should contain only letters, spaces, hyphens, and periods';
    }
    
    if (userProviderForm.contactPhone.trim() && !validatePhone(userProviderForm.contactPhone)) {
      errors.contactPhone = 'Phone must be 8 digits (landline) or 10 digits (mobile) - numbers only';
    }
    
    setUserFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PowerGrid</Text>
        <Text style={styles.headerSubtitle}>Smart Energy Management</Text>
      </View>
      
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'marketplace' && styles.activeTab]}
          onPress={() => setActiveTab('marketplace')}
        >
          <Text style={[styles.tabText, activeTab === 'marketplace' && styles.activeTabText]}>
            Marketplace
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'storage' && styles.activeTab]}
          onPress={() => setActiveTab('storage')}
        >
          <Text style={[styles.tabText, activeTab === 'storage' && styles.activeTabText]}>
            Storage
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'personal' && styles.activeTab]}
          onPress={() => setActiveTab('personal')}
        >
          <Text style={[styles.tabText, activeTab === 'personal' && styles.activeTabText]}>
            Personal
          </Text>
        </TouchableOpacity>
      </View>
      
      
      
      {/* Wrap content with gesture handler for multitouch support */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PinchGestureHandler onGestureEvent={onPinchGestureEvent}>
          <View style={{ flex: 1 }}>
            <PanGestureHandler 
              onGestureEvent={onPanGestureEvent}
              onHandlerStateChange={onPanStateChange}
              enabled={zoomLevel > 1}
              shouldCancelWhenOutside={true}
            >
              <View style={{ flex: 1 }}>
                <TapGestureHandler
                  onHandlerStateChange={onTwoFingerTap}
                  numberOfTaps={1}
                >
                  <View style={[
                    { flex: 1 },
                    {
                      transform: [
                        { translateX: panOffset.x },
                        { translateY: panOffset.y },
                        { scale: zoomLevel }
                      ]
                    }
                  ]}>
      {activeTab === 'marketplace' && renderMarketplace()}
                    {activeTab === 'storage' && renderStorageCalculator()}
      {activeTab === 'personal' && renderPersonalData()}
                  </View>
                </TapGestureHandler>
              </View>
            </PanGestureHandler>
          </View>
        </PinchGestureHandler>
        
        {/* Separate pull-to-refresh handler for marketplace */}
        {activeTab === 'marketplace' && (
          <PanGestureHandler
            onGestureEvent={onPullToRefresh}
            onHandlerStateChange={onPanStateChange}
            enabled={zoomLevel === 1} // Only enable when not zoomed
            shouldCancelWhenOutside={false}
          >
            <View style={styles.pullToRefreshOverlay} />
          </PanGestureHandler>
        )}
      </GestureHandlerRootView>

      <Modal
        visible={showProviderModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProviderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Purchase Electricity</Text>
            {selectedProvider && (
              <>
                <Text style={styles.modalProvider}>{selectedProvider.name}</Text>
                <Text style={styles.modalPrice}>${selectedProvider.price}/kWh</Text>
                <Text style={styles.modalAvailable}>{selectedProvider.available} kWh available</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Purchase Amount (kWh)</Text>
                  <TextInput
                    style={styles.input}
                    value={purchaseAmount}
                    onChangeText={setPurchaseAmount}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                  />
                </View>
                
                {purchaseAmount && (
                  <View style={styles.purchaseSummary}>
                    <Text style={styles.summaryText}>
                      Total Cost: ${(parseFloat(purchaseAmount) * selectedProvider.price).toFixed(2)}
                    </Text>
                  </View>
                )}
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setShowProviderModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.confirmButton}
                    onPress={handlePurchase}
                  >
                    <Text style={styles.confirmButtonText}>Purchase</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Add Provider Modal */}
      <Modal
        visible={showAddProviderModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddProviderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Add New Provider</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Provider Name *</Text>
              <TextInput
                style={[styles.input, adminFormErrors.name && styles.inputError]}
                value={providerForm.name}
                onChangeText={(text) => {
                  setProviderForm({...providerForm, name: text});
                  if (adminFormErrors.name) {
                    setAdminFormErrors({...adminFormErrors, name: ''});
                  }
                }}
                placeholder="Enter provider name"
              />
              {adminFormErrors.name && (
                <Text style={styles.errorText}>{adminFormErrors.name}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Energy Type</Text>
              <View style={styles.pickerContainer}>
                {['Solar', 'Wind', 'Hydro', 'Nuclear', 'Biomass', 'Geothermal'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      providerForm.type === type && styles.typeOptionSelected
                    ]}
                    onPress={() => setProviderForm({...providerForm, type})}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      providerForm.type === type && styles.typeOptionTextSelected
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price per kWh *</Text>
              <TextInput
                style={[styles.input, adminFormErrors.price && styles.inputError]}
                value={providerForm.price}
                onChangeText={(text) => {
                  setProviderForm({...providerForm, price: text});
                  if (adminFormErrors.price) {
                    setAdminFormErrors({...adminFormErrors, price: ''});
                  }
                }}
                placeholder="0.00"
                keyboardType="numeric"
              />
              {adminFormErrors.price && (
                <Text style={styles.errorText}>{adminFormErrors.price}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Rating (0-5)</Text>
              <TextInput
                style={styles.input}
                value={providerForm.rating}
                onChangeText={(text) => setProviderForm({...providerForm, rating: text})}
                placeholder="4.0"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Available Capacity (kWh)</Text>
              <TextInput
                style={styles.input}
                value={providerForm.available}
                onChangeText={(text) => setProviderForm({...providerForm, available: text})}
                placeholder="100"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, adminFormErrors.description && styles.inputError]}
                value={providerForm.description}
                onChangeText={(text) => {
                  setProviderForm({...providerForm, description: text});
                  if (adminFormErrors.description) {
                    setAdminFormErrors({...adminFormErrors, description: ''});
                  }
                }}
                placeholder="Describe the energy service"
                multiline
                numberOfLines={3}
              />
              {adminFormErrors.description && (
                <Text style={styles.errorText}>{adminFormErrors.description}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={[styles.input, adminFormErrors.location && styles.inputError]}
                value={providerForm.location}
                onChangeText={(text) => {
                  setProviderForm({...providerForm, location: text});
                  if (adminFormErrors.location) {
                    setAdminFormErrors({...adminFormErrors, location: ''});
                  }
                }}
                placeholder="City"
              />
              {adminFormErrors.location && (
                <Text style={styles.errorText}>{adminFormErrors.location}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Email</Text>
              <TextInput
                style={[styles.input, adminFormErrors.contactEmail && styles.inputError]}
                value={providerForm.contactEmail}
                onChangeText={(text) => {
                  setProviderForm({...providerForm, contactEmail: text});
                  if (adminFormErrors.contactEmail) {
                    setAdminFormErrors({...adminFormErrors, contactEmail: ''});
                  }
                }}
                placeholder="contact@provider.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {adminFormErrors.contactEmail && (
                <Text style={styles.errorText}>{adminFormErrors.contactEmail}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Phone</Text>
              <TextInput
                style={[styles.input, adminFormErrors.contactPhone && styles.inputError]}
                value={providerForm.contactPhone}
                onChangeText={(text) => {
                  setProviderForm({...providerForm, contactPhone: text});
                  if (adminFormErrors.contactPhone) {
                    setAdminFormErrors({...adminFormErrors, contactPhone: ''});
                  }
                }}
                placeholder="04XX XXX XXX"
                keyboardType="phone-pad"
              />
              <Text style={styles.helperText}>
                Australian format: Mobile (04XX XXX XXX) or Landline (XX XXXX XXXX)
              </Text>
              {adminFormErrors.contactPhone && (
                <Text style={styles.errorText}>{adminFormErrors.contactPhone}</Text>
              )}
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddProviderModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleAddProvider}
              >
                <Text style={styles.confirmButtonText}>Add Provider</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Provider Modal */}
      <Modal
        visible={showEditProviderModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditProviderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Edit Provider</Text>
            
            {editingProvider && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Provider Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={editingProvider.name}
                    onChangeText={(text) => setEditingProvider({...editingProvider, name: text})}
                    placeholder="Enter provider name"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Energy Type</Text>
                  <View style={styles.pickerContainer}>
                    {['Solar', 'Wind', 'Hydro', 'Nuclear', 'Biomass', 'Geothermal'].map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeOption,
                          editingProvider.type === type && styles.typeOptionSelected
                        ]}
                        onPress={() => setEditingProvider({...editingProvider, type})}
                      >
                        <Text style={[
                          styles.typeOptionText,
                          editingProvider.type === type && styles.typeOptionTextSelected
                        ]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Price per kWh *</Text>
                  <TextInput
                    style={styles.input}
                    value={editingProvider.price}
                    onChangeText={(text) => setEditingProvider({...editingProvider, price: text})}
                    placeholder="0.00"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Rating (0-5)</Text>
                  <TextInput
                    style={styles.input}
                    value={editingProvider.rating}
                    onChangeText={(text) => setEditingProvider({...editingProvider, rating: text})}
                    placeholder="4.0"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Available Capacity (kWh)</Text>
                  <TextInput
                    style={styles.input}
                    value={editingProvider.available}
                    onChangeText={(text) => setEditingProvider({...editingProvider, available: text})}
                    placeholder="100"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Description *</Text>
                  <TextInput
                    style={styles.input}
                    value={editingProvider.description}
                    onChangeText={(text) => setEditingProvider({...editingProvider, description: text})}
                    placeholder="Enter description"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Location</Text>
                  <TextInput
                    style={styles.input}
                    value={editingProvider.location}
                    onChangeText={(text) => setEditingProvider({...editingProvider, location: text})}
                    placeholder="City"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contact Email</Text>
                  <TextInput
                    style={styles.input}
                    value={editingProvider.contactEmail}
                    onChangeText={(text) => setEditingProvider({...editingProvider, contactEmail: text})}
                    placeholder="info@provider.com"
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contact Phone</Text>
                  <TextInput
                    style={styles.input}
                    value={editingProvider.contactPhone}
                    onChangeText={(text) => setEditingProvider({...editingProvider, contactPhone: text})}
                    placeholder="+1-555-0123"
                    keyboardType="phone-pad"
                  />
                </View>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setShowEditProviderModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.confirmButton}
                    onPress={handleEditProvider}
                  >
                    <Text style={styles.confirmButtonText}>Update Provider</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
      {/* Web Delete Confirmation Modal */}
      <Modal
        visible={webDeleteConfirm.visible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setWebDeleteConfirm({ visible: false, provider: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Delete</Text>
            <Text style={{ marginBottom: 20 }}>
              {webDeleteConfirm.provider
                ? `Are you sure you want to delete '${webDeleteConfirm.provider.name}'?\n\nThis action cannot be undone.`
                : ''}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setWebDeleteConfirm({ visible: false, provider: null })}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={async () => {
                  if (webDeleteConfirm.provider) {
                    await handleDeleteProvider(webDeleteConfirm.provider._id);
                  }
                  setWebDeleteConfirm({ visible: false, provider: null });
                }}
              >
                <Text style={styles.confirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Become Provider Modal */}
      <Modal
        visible={showBecomeProviderModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBecomeProviderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Become a Provider</Text>
            <Text style={styles.modalSubtitle}>Register to sell electricity in the marketplace</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Provider Name *</Text>
              <TextInput
                style={[styles.input, userFormErrors.name && styles.inputError]}
                value={userProviderForm.name}
                onChangeText={(text) => {
                  setUserProviderForm({...userProviderForm, name: text});
                  if (userFormErrors.name) {
                    setUserFormErrors({...userFormErrors, name: ''});
                  }
                }}
                placeholder="Enter your provider name"
              />
              {userFormErrors.name && (
                <Text style={styles.errorText}>{userFormErrors.name}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Energy Type</Text>
              <View style={styles.pickerContainer}>
                {['Solar', 'Wind', 'Hydro', 'Nuclear', 'Biomass', 'Geothermal'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      userProviderForm.type === type && styles.typeOptionSelected
                    ]}
                    onPress={() => setUserProviderForm({...userProviderForm, type})}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      userProviderForm.type === type && styles.typeOptionTextSelected
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price per kWh *</Text>
              <TextInput
                style={[styles.input, userFormErrors.price && styles.inputError]}
                value={userProviderForm.price}
                onChangeText={(text) => {
                  setUserProviderForm({...userProviderForm, price: text});
                  if (userFormErrors.price) {
                    setUserFormErrors({...userFormErrors, price: ''});
                  }
                }}
                placeholder="0.00"
                keyboardType="numeric"
              />
              {userFormErrors.price && (
                <Text style={styles.errorText}>{userFormErrors.price}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Rating (0-5)</Text>
              <TextInput
                style={styles.input}
                value={userProviderForm.rating}
                onChangeText={(text) => setUserProviderForm({...userProviderForm, rating: text})}
                placeholder="4.0"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Available Capacity (kWh)</Text>
              <TextInput
                style={styles.input}
                value={userProviderForm.available}
                onChangeText={(text) => setUserProviderForm({...userProviderForm, available: text})}
                placeholder="100"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, userFormErrors.description && styles.inputError]}
                value={userProviderForm.description}
                onChangeText={(text) => {
                  setUserProviderForm({...userProviderForm, description: text});
                  if (userFormErrors.description) {
                    setUserFormErrors({...userFormErrors, description: ''});
                  }
                }}
                placeholder="Describe your energy service"
                multiline
                numberOfLines={3}
              />
              {userFormErrors.description && (
                <Text style={styles.errorText}>{userFormErrors.description}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={[styles.input, userFormErrors.location && styles.inputError]}
                value={userProviderForm.location}
                onChangeText={(text) => {
                  setUserProviderForm({...userProviderForm, location: text});
                  if (userFormErrors.location) {
                    setUserFormErrors({...userFormErrors, location: ''});
                  }
                }}
                placeholder="City"
              />
              {userFormErrors.location && (
                <Text style={styles.errorText}>{userFormErrors.location}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Phone</Text>
              <TextInput
                style={styles.input}
                value={userProviderForm.contactPhone}
                onChangeText={(text) => setUserProviderForm({...userProviderForm, contactPhone: text})}
                placeholder="+1-555-0123"
                keyboardType="phone-pad"
              />
              <Text style={styles.helperText}>
                Australian format: Mobile (04XX XXX XXX) or Landline (XX XXXX XXXX)
              </Text>
              {userFormErrors.contactPhone && (
                <Text style={styles.errorText}>{userFormErrors.contactPhone}</Text>
              )}
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowBecomeProviderModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={registerAsProvider}
              >
                <Text style={styles.confirmButtonText}>Register as Provider</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2E7D32',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E8F5E8',
    marginTop: 5,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#2E7D32',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  calculatorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  resultsCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalCost: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  marketplaceHeader: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  statusIndicator: {
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  balanceCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
    alignItems: 'center',
  },
  balanceTitle: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 5,
  },
  providerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  providerInfo: {
    marginBottom: 10,
  },
  providerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  providerType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  providerDescription: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
    fontStyle: 'italic',
  },
  providerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  rating: {
    fontSize: 12,
    color: '#666',
  },
  providerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  available: {
    fontSize: 12,
    color: '#666',
  },
  buyButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  purchasesCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  purchasesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  purchaseItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  purchaseProvider: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  purchaseDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  personalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 25,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  userSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  currentProvider: {
    fontSize: 12,
    color: '#2E7D32',
    marginTop: 5,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  billingCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 25,
  },
  billingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  billingLabel: {
    fontSize: 14,
    color: '#666',
  },
  billingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  consumptionChart: {
    marginBottom: 25,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    backgroundColor: '#2E7D32',
    borderRadius: 2,
    marginBottom: 5,
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
  },
  carbonFootprint: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  carbonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  carbonValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  carbonSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalProvider: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 5,
  },
  modalPrice: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  modalAvailable: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  purchaseSummary: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  noDataCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  adminToggle: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: 'center',
  },
  adminToggleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  adminActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButtonLoading: {
    backgroundColor: '#FF9800',
    opacity: 0.7,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  addProviderButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  addProviderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 5,
  },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
  },
  typeOptionSelected: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  typeOptionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  typeOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  debugInfo: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
  },
  debugText: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'monospace',
  },
  infoCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: 13,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 2,
    alignSelf: 'center',
  },
  segmentButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: '#2E7D32',
  },
  segmentText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  segmentTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    borderRadius: 8,
    padding: 10,
    marginTop: 18,
  },
  tipsText: {
    fontSize: 13,
    color: '#2E7D32',
    flex: 1,
  },
  faqCard: {
    backgroundColor: '#fffde7',
    borderRadius: 8,
    padding: 14,
    marginTop: 22,
    marginBottom: 10,
  },
  faqTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 6,
  },
  faqText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  adminHeader: {
    backgroundColor: '#E8F5E8',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adminTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 8,
  },
  adminSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  adminDirections: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  directionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  directionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  directionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionCount: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  providerListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  providerListInfo: {
    flex: 1,
  },
  providerListName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  providerListType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  providerListPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginTop: 4,
  },
  providerListStats: {
    alignItems: 'flex-end',
  },
  providerListRating: {
    fontSize: 12,
    color: '#666',
  },
  providerListAvailable: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 2,
  },
  purchaseListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  purchaseListInfo: {
    flex: 1,
  },
  purchaseListProvider: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  purchaseListDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  purchaseListAmount: {
    fontSize: 14,
    color: '#2196F3',
    marginTop: 4,
  },
  purchaseListStats: {
    alignItems: 'flex-end',
  },
  purchaseListCost: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  purchaseListStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  adminLogoutButton: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adminLogoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  providerStatusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  providerStatusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  providerStatusActive: {
    alignItems: 'center',
  },
  providerStatusInactive: {
    alignItems: 'center',
  },
  providerStatusText: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  providerStatusDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  becomeProviderButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  becomeProviderText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelProviderButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  cancelProviderText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  ownProviderIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  ownProviderText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  inputError: {
    borderColor: '#F44336',
    borderWidth: 2,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  helperText: {
    color: '#666',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  multitouchHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },

  pullToRefreshIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1000,
  },
  pullToRefreshText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },

  pullToRefreshOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
});
