// ============================================================================
// POWERGRID MARKETPLACE - MAIN APPLICATION COMPONENT
// ============================================================================
// This is the main component that handles the entire marketplace application
// including user authentication, provider management, and purchase functionality

// Import icons for the UI (battery, solar, etc.)

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
  ScrollView, // For status bar styling
  Text, // For displaying text
  TextInput, // For input fields (forms)
  TouchableOpacity, // For touchable buttons
  View // For container views (like div in web)
} from 'react-native';

// Import styles from separate file for easier debugging
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import {
  checkApiConnection,
  createProvider,
  createPurchase,
  deleteProvider,
  fetchProviders,
  fetchUserPurchases,
  updateProvider
} from './components/crud';
import Header from './components/Header';
import { validateAdminForm, validateUserForm } from './components/validation';
import { styles } from './styles';
import MarketplaceTab from './tab/MarketplaceTab';
import PersonalTab from './tab/PersonalTab';
import StorageTab from './tab/StorageTab';

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
  
  // State to control navigation from marketplace to personal tab
  const [navigateToPersonal, setNavigateToPersonal] = useState(false);
  
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



  // Pull-to-refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshOffset, setRefreshOffset] = useState(0);
  
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
      if (activeTab === 'marketplace' && refreshOffset > 50) {
        handlePullToRefresh();
      }
      setRefreshOffset(0);
    }
  };
  
  // Pull-to-refresh handler
  const handlePullToRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    console.log('🔄 Pull-to-refresh triggered');
    
    try {
      await fetchProviders(API_BASE_URL, setIsLoading, setElectricityProviders);
      Alert.alert('Success', 'Marketplace refreshed!');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh marketplace');
    } finally {
      setIsRefreshing(false);
    }
  };
  

  
  // (Zoom functionality removed)

  // Initialize API connection on component mount
  useEffect(() => {
    const initializeApp = async () => {
             const isConnected = await checkApiConnection(API_ORIGIN, setApiStatus);
      if (isConnected) {
        await fetchProviders(API_BASE_URL, setIsLoading, setElectricityProviders);
                 await fetchUserPurchases(API_BASE_URL, setUserPurchases);
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
            onPress: () => handleTabChange('personal')
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
             savedPurchase = await createPurchase(API_BASE_URL, selectedProvider._id || selectedProvider.id, amount, cost);
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
      await fetchProviders(API_BASE_URL, setIsLoading, setElectricityProviders);
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
    if (!validateAdminForm(providerForm, setAdminFormErrors)) {
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
      const result = await createProvider(API_BASE_URL, providerData, () => fetchProviders(API_BASE_URL, setIsLoading, setElectricityProviders));
      
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
        await fetchProviders(API_BASE_URL, setIsLoading, setElectricityProviders); // Refresh provider list
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
      const result = await updateProvider(API_BASE_URL, editingProvider._id, providerData, () => fetchProviders(API_BASE_URL, setIsLoading, setElectricityProviders));
      
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
      const success = await deleteProvider(API_BASE_URL, providerId);
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
    if (!validateUserForm(userProviderForm, setUserFormErrors)) {
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
      const result = await createProvider(API_BASE_URL, providerData, () => fetchProviders(API_BASE_URL, setIsLoading, setElectricityProviders));
      
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
        Alert.alert('Success', 'You are now registered as provider!');
        await fetchProviders(API_BASE_URL, setIsLoading, setElectricityProviders); // Refresh provider list
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
              const success = await deleteProvider(API_BASE_URL, userProviderStatus._id);
              if (success) {
                setUserProviderStatus(null);
                Alert.alert('Success', 'Provider status cancelled successfully!');
                await fetchProviders(API_BASE_URL, setIsLoading, setElectricityProviders); // Refresh provider list
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

  // Debug function to track tab changes
  const handleTabChange = (tab: string) => {
    console.log('handleTabChange called with:', tab);
    console.log('Previous activeTab:', activeTab);
    setActiveTab(tab);
    console.log('New activeTab set to:', tab);
  };

  // Debug: Monitor activeTab changes
  useEffect(() => {
    console.log('activeTab state changed to:', activeTab);
  }, [activeTab]);

  // Handle navigation from marketplace to personal tab
  useEffect(() => {
    if (navigateToPersonal) {
      console.log('navigateToPersonal triggered, changing activeTab to personal');
      setActiveTab('personal');
      setNavigateToPersonal(false);
    }
  }, [navigateToPersonal]);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="PowerGrid" subtitle="Smart Energy Management" />
      
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'marketplace' && styles.activeTab]}
          onPress={() => handleTabChange('marketplace')}
        >
          <Text style={[styles.tabText, activeTab === 'marketplace' && styles.activeTabText]}>
            Marketplace
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'storage' && styles.activeTab]}
          onPress={() => handleTabChange('storage')}
        >
          <Text style={[styles.tabText, activeTab === 'storage' && styles.activeTabText]}>
            Storage
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'personal' && styles.activeTab]}
          onPress={() => handleTabChange('personal')}
        >
          <Text style={[styles.tabText, activeTab === 'personal' && styles.activeTabText]}>
            Personal
          </Text>
        </TouchableOpacity>
      </View>
      
      
      
      {/* Wrap content with gesture handler root (zoom removed) */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
              <View style={{ flex: 1 }}>
      {activeTab === 'marketplace' && (
        <MarketplaceTab
          // State props
          activeTab={activeTab}
          isLoading={isLoading}
          electricityProviders={electricityProviders}
          userBalance={userBalance}
          userPurchases={userPurchases}
          isAdminMode={isAdminMode}
          loggedInUser={loggedInUser}
          userProviderStatus={userProviderStatus}
          deletingProviderId={deletingProviderId}
          showProviderModal={showProviderModal}
          showAddProviderModal={showAddProviderModal}
          showEditProviderModal={showEditProviderModal}
          showBecomeProviderModal={showBecomeProviderModal}
          selectedProvider={selectedProvider}
          editingProvider={editingProvider}
          purchaseAmount={purchaseAmount}
          refreshOffset={refreshOffset}
          apiStatus={apiStatus}
          
          // Form states
          providerForm={providerForm}
          userProviderForm={userProviderForm}
          adminFormErrors={adminFormErrors}
          userFormErrors={userFormErrors}
          
          // Web delete confirmation
          webDeleteConfirm={webDeleteConfirm}
          
          // Handler functions
          setSelectedProvider={setSelectedProvider}
          setShowProviderModal={setShowProviderModal}
          setShowAddProviderModal={setShowAddProviderModal}
          setShowEditProviderModal={setShowEditProviderModal}
          setShowBecomeProviderModal={setShowBecomeProviderModal}
          setEditingProvider={setEditingProvider}
          setPurchaseAmount={setPurchaseAmount}
          setProviderForm={setProviderForm}
          setUserProviderForm={setUserProviderForm}
          setWebDeleteConfirm={setWebDeleteConfirm}
          
          // Form error setter functions
          setAdminFormErrors={setAdminFormErrors}
          setUserFormErrors={setUserFormErrors}
          
                     // API configuration
           API_ORIGIN={API_ORIGIN}
           API_BASE_URL={API_BASE_URL}
           setApiStatus={setApiStatus}
           setIsLoading={setIsLoading}
           setElectricityProviders={setElectricityProviders}
           
           // API functions
           checkApiConnection={checkApiConnection}
           fetchProviders={fetchProviders}
           createProvider={createProvider}
           updateProvider={updateProvider}
           deleteProvider={deleteProvider}
          
          // Handler functions
          handlePurchase={handlePurchase}
          handleAddProvider={handleAddProvider}
          handleEditProvider={handleEditProvider}
          handleDeleteProvider={handleDeleteProvider}
          confirmDeleteProvider={confirmDeleteProvider}
          openEditModal={openEditModal}
          registerAsProvider={registerAsProvider}
          cancelProviderStatus={cancelProviderStatus}
          
          
          
          // Tab navigation
          setActiveTab={setActiveTab}
          setNavigateToPersonal={setNavigateToPersonal}
        />
      )}
                    {activeTab === 'storage' && (
                      <StorageTab
                        // Storage calculator state
                        storageCapacity={storageCapacity}
                        dailyUsage={dailyUsage}
                        setStorageCapacity={setStorageCapacity}
                        setDailyUsage={setDailyUsage}
                        
                        // Solar panel calculator state
                        solarDailyUsage={solarDailyUsage}
                        solarSunHours={solarSunHours}
                        solarPanelCost={solarPanelCost}
                        solarInstallCost={solarInstallCost}
                        setSolarDailyUsage={setSolarDailyUsage}
                        setSolarSunHours={setSolarSunHours}
                        setSolarPanelCost={setSolarPanelCost}
                        setSolarInstallCost={setSolarInstallCost}
                        
                        // Tab selection
                        storageTab={storageTab}
                        setStorageTab={setStorageTab}
                        
                        // Calculation results
                        storageCost={storageCost}
                        solarResult={solarResult}
                      />
                    )}
                    {activeTab === 'personal' && (
                      <PersonalTab
                        // User data
                        userBalance={userBalance}
                        userPurchases={userPurchases}
                        loggedInUser={loggedInUser}
                        userProviderStatus={userProviderStatus}
                        electricityProviders={electricityProviders}
                        
                        // Login state
                        loginState={loginState}
                        setLoginState={setLoginState}
                        
                        // Actions
                        setShowBecomeProviderModal={setShowBecomeProviderModal}
                        cancelProviderStatus={cancelProviderStatus}
                        handleLogin={handleLogin}
                        handleLogout={handleLogout}
                        
                        // User data for dashboard
                        userData={userData}
                      />
                    )}
              </View>
            </View>
          </View>
        </View>
        
        {/* Separate pull-to-refresh handler for marketplace */}
        {activeTab === 'marketplace' && (
          <PanGestureHandler
            onGestureEvent={onPullToRefresh}
            onHandlerStateChange={onPanStateChange}
            enabled={true}
            shouldCancelWhenOutside={false}
          >
            <View style={styles.pullToRefreshOverlay} />
          </PanGestureHandler>
        )}
      </GestureHandlerRootView>



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
                    placeholder="04XX XXX XXX"
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
                placeholder="04XX XXX XXX"
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