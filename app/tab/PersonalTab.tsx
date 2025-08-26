import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { loadPriceAlerts, loadSavedProviders, removePriceAlert, toggleSaveProvider as spToggleSaveProvider, upsertPriceAlert, type PriceAlert, type PriceAlertDirection, type SavedProvider } from '../components/savedProviders';
import { styles } from '../styles';

interface PersonalTabProps {
  // User data
  userBalance: number;
  userPurchases: any[];
  loggedInUser: 'admin' | 'user' | null;
  userProviderStatus: any;
  electricityProviders: any[];
  setSavedProviderIds?: (ids: string[]) => void;
  
  // Login state
  loginState: { username: string; password: string; error: string };
  setLoginState: (state: { username: string; password: string; error: string }) => void;
  
  // Actions
  setShowBecomeProviderModal: (show: boolean) => void;
  cancelProviderStatus: () => Promise<void>;
  handleLogin: () => void;
  handleLogout: () => void;
  
  // User data for dashboard
  userData: any;
}

export default function PersonalTab({
  // User data
  userBalance,
  userPurchases,
  loggedInUser,
  userProviderStatus,
  electricityProviders,
  setSavedProviderIds,
  
  // Login state
  loginState,
  setLoginState,
  
  // Actions
  setShowBecomeProviderModal,
  cancelProviderStatus,
  handleLogin,
  handleLogout,
  
  // User data for dashboard
  userData
}: PersonalTabProps) {
  const [alerts, setAlerts] = React.useState<PriceAlert[]>([]);
  const [showAlertEditor, setShowAlertEditor] = React.useState(false);
  const [editingAlert, setEditingAlert] = React.useState<PriceAlert | null>(null);
  const [editorProviderId, setEditorProviderId] = React.useState('');
  const [editorDirection, setEditorDirection] = React.useState<PriceAlertDirection>('price_below');
  const [editorTargetPrice, setEditorTargetPrice] = React.useState('');
  const [saved, setSaved] = React.useState<SavedProvider[]>([]);

  const loadAlerts = React.useCallback(async () => {
    try {
      const list = await loadPriceAlerts();
      setAlerts(list);
    } catch {}
  }, []);

  React.useEffect(() => {
    const run = async () => {
      await loadAlerts();
      try {
        const s = await loadSavedProviders();
        setSaved(s);
        if (setSavedProviderIds) setSavedProviderIds(s.map(p => p.id));
      } catch {}
    };
    if (loggedInUser) run();
  }, [loggedInUser, loadAlerts]);

  const openCreateAlert = () => {
    setEditingAlert(null);
    setEditorProviderId('');
    setEditorDirection('price_below');
    setEditorTargetPrice('');
    setShowAlertEditor(true);
  };

  const openEditAlert = (alert: PriceAlert) => {
    setEditingAlert(alert);
    setEditorProviderId(alert.providerId);
    setEditorDirection(alert.direction);
    setEditorTargetPrice(String(alert.targetPrice));
    setShowAlertEditor(true);
  };

  const saveAlert = async () => {
    const price = parseFloat(editorTargetPrice);
    if (!editorProviderId) {
      Alert.alert('Validation', 'Select a provider');
      return;
    }
    if (isNaN(price) || price <= 0) {
      Alert.alert('Validation', 'Enter a valid target price');
      return;
    }
    try {
      await upsertPriceAlert({
        id: editingAlert?.id,
        providerId: editorProviderId,
        targetPrice: price,
        direction: editorDirection,
        enabled: editingAlert?.enabled ?? true
      });
      setShowAlertEditor(false);
      setEditingAlert(null);
      await loadAlerts();
    } catch {
      Alert.alert('Error', 'Failed to save alert');
    }
  };

  const toggleEnabled = async (alert: PriceAlert) => {
    try {
      await upsertPriceAlert({
        id: alert.id,
        providerId: alert.providerId,
        targetPrice: alert.targetPrice,
        direction: alert.direction,
        enabled: !alert.enabled
      });
      await loadAlerts();
    } catch {}
  };

  const deleteAlert = async (alert: PriceAlert) => {
    Alert.alert('Delete Alert', 'Are you sure you want to delete this alert?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await removePriceAlert(alert.id);
            await loadAlerts();
          } catch {
            Alert.alert('Error', 'Failed to delete alert');
          }
        }
      }
    ]);
  };

  const providerNameOf = (providerId: string) => {
    const p = electricityProviders.find(p => (p._id || p.id) === providerId);
    return p ? p.name : providerId;
  };
  const removeSavedProvider = async (item: SavedProvider) => {
    try {
      await spToggleSaveProvider({ id: item.id, name: item.name, type: item.type });
      const s = await loadSavedProviders();
      setSaved(s);
      if (setSavedProviderIds) setSavedProviderIds(s.map(p => p.id));
    } catch {
      Alert.alert('Error', 'Failed to remove saved provider');
    }
  };
  
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
              <Ionicons name="time" size={20} color="#FF9800" />
              <Text style={styles.directionText}>View providers and purchases in the History tab</Text>
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

          {/* Recent Purchases moved to History tab */}

          {/* Logout Button */}
          <TouchableOpacity style={[styles.adminLogoutButton, { marginBottom: 24 }]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.adminLogoutText}>Logout</Text>
          </TouchableOpacity>
          <View style={{ height: 24 }} />
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
          
          {/* Alerts moved to Alerts tab */}

          {/* Saved Providers Section */}
          {/* Saved Providers moved to Alerts tab */}

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

  const content = renderPersonalData();
  return (
    <>
      {content}
      <AlertsEditorModal
        visible={showAlertEditor}
        onClose={() => setShowAlertEditor(false)}
        providers={electricityProviders}
        providerId={editorProviderId}
        setProviderId={setEditorProviderId}
        direction={editorDirection}
        setDirection={setEditorDirection}
        targetPrice={editorTargetPrice}
        setTargetPrice={setEditorTargetPrice}
        onSave={saveAlert}
      />
    </>
  );
}

// Inline modal editor for creating/updating alerts
// Placed after default export to keep JSX co-located
export function AlertsEditorModal({
  visible,
  onClose,
  providers,
  providerId,
  setProviderId,
  direction,
  setDirection,
  targetPrice,
  setTargetPrice,
  onSave
}: {
  visible: boolean;
  onClose: () => void;
  providers: any[];
  providerId: string;
  setProviderId: (id: string) => void;
  direction: PriceAlertDirection;
  setDirection: (d: PriceAlertDirection) => void;
  targetPrice: string;
  setTargetPrice: (p: string) => void;
  onSave: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Price Alert</Text>
          <Text style={styles.modalSubtitle}>Select provider and target price</Text>

          <Text style={styles.label}>Provider</Text>
          <ScrollView style={{ maxHeight: 160 }}>
            {providers.map((p: any) => {
              const id = p._id || p.id;
              if (!id) return null;
              const selected = id === providerId;
              return (
                <TouchableOpacity key={id} style={[styles.providerListItem, selected ? { borderColor: '#2E7D32', borderWidth: 1 } : null]} onPress={() => setProviderId(id)}>
                  <View style={styles.providerListInfo}>
                    <Text style={styles.providerListName}>{p.name}</Text>
                    <Text style={styles.providerListPrice}>${p.price}/kWh</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={[styles.label, { marginTop: 12 }]}>Condition</Text>
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <TouchableOpacity style={[styles.smallButton, direction === 'price_below' ? { backgroundColor: '#2E7D32' } : { backgroundColor: '#ccc' }]} onPress={() => setDirection('price_below')}>
              <Text style={[styles.smallButtonText, { color: '#fff' }]}>Price below than</Text>
            </TouchableOpacity>
            <View style={{ width: 8 }} />
            <TouchableOpacity style={[styles.smallButton, direction === 'kwh_above' ? { backgroundColor: '#2E7D32' } : { backgroundColor: '#ccc' }]} onPress={() => setDirection('kwh_above')}>
              <Text style={[styles.smallButtonText, { color: '#fff' }]}>kWh more than</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>{direction === 'kwh_above' ? 'Target kWh (available)' : 'Target Price ($/kWh)'}</Text>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            value={targetPrice}
            onChangeText={setTargetPrice}
            placeholder={direction === 'kwh_above' ? 'e.g. 500' : 'e.g. 0.20'}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={onSave}>
              <Text style={styles.confirmButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
