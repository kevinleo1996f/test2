import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { styles } from '../styles';

interface MarketplaceTabProps {
  // State props
  activeTab: string;
  isLoading: boolean;
  electricityProviders: any[];
  userBalance: number;
  userPurchases: any[];
  isAdminMode: boolean;
  loggedInUser: 'admin' | 'user' | null;
  userProviderStatus: any;
  deletingProviderId: string | null;
  showProviderModal: boolean;
  showAddProviderModal: boolean;
  showEditProviderModal: boolean;
  showBecomeProviderModal: boolean;
  selectedProvider: any;
  editingProvider: any;
  purchaseAmount: string;
  refreshOffset: number;
  apiStatus: string;
  
  // Form states
  providerForm: any;
  userProviderForm: any;
  adminFormErrors: {[key: string]: string};
  userFormErrors: {[key: string]: string};
  
  // Web delete confirmation
  webDeleteConfirm: { visible: boolean; provider: any | null };
  
  // Handler functions
  setSelectedProvider: (provider: any) => void;
  setShowProviderModal: (show: boolean) => void;
  setShowAddProviderModal: (show: boolean) => void;
  setShowEditProviderModal: (show: boolean) => void;
  setShowBecomeProviderModal: (show: boolean) => void;
  setEditingProvider: (provider: any) => void;
  setPurchaseAmount: (amount: string) => void;
  setProviderForm: (form: any) => void;
  setUserProviderForm: (form: any) => void;
  setWebDeleteConfirm: (confirm: { visible: boolean; provider: any | null }) => void;
  
  // Form error setter functions
  setAdminFormErrors: (errors: {[key: string]: string}) => void;
  setUserFormErrors: (errors: {[key: string]: string}) => void;
  
  // API configuration
  API_ORIGIN: string;
  API_BASE_URL: string;
  setApiStatus: (status: string) => void;
  setIsLoading: (loading: boolean) => void;
  setElectricityProviders: (providers: any[]) => void;
  
  // API functions
  checkApiConnection: (API_ORIGIN: string, setApiStatus: (status: string) => void) => Promise<boolean>;
  fetchProviders: (API_BASE_URL: string, setIsLoading: (loading: boolean) => void, setElectricityProviders: (providers: any[]) => void) => Promise<void>;
  createProvider: (API_BASE_URL: string, providerData: any, refreshCallback: () => Promise<void>) => Promise<any>;
  updateProvider: (API_BASE_URL: string, providerId: string, providerData: any, refreshCallback: () => Promise<void>) => Promise<any>;
  deleteProvider: (API_BASE_URL: string, providerId: string) => Promise<boolean>;
  
  // Saved providers & alerts
  savedProviderIds: string[];
  onToggleSaveProvider: (provider: any) => Promise<void> | void;
  onCreatePriceAlert: (provider: any) => void;
  
  // Handler functions
  handlePurchase: () => Promise<void>;
  handleAddProvider: () => Promise<void>;
  handleEditProvider: () => Promise<void>;
  handleDeleteProvider: (providerId: string) => Promise<void>;
  confirmDeleteProvider: (provider: any) => void;
  openEditModal: (provider: any) => void;
  registerAsProvider: () => Promise<void>;
  cancelProviderStatus: () => Promise<void>;
  

  
  // Tab navigation
  setActiveTab: (tab: string) => void;
  setNavigateToPersonal: (navigate: boolean) => void;
}

export default function MarketplaceTab({
  // State props
  activeTab,
  isLoading,
  electricityProviders,
  userBalance,
  userPurchases,
  isAdminMode,
  loggedInUser,
  userProviderStatus,
  deletingProviderId,
  showProviderModal,
  showAddProviderModal,
  showEditProviderModal,
  showBecomeProviderModal,
  selectedProvider,
  editingProvider,
  purchaseAmount,
  refreshOffset,
  apiStatus,
  
  // Form states
  providerForm,
  userProviderForm,
  adminFormErrors,
  userFormErrors,
  
  // Web delete confirmation
  webDeleteConfirm,
  
  // Handler functions
  setSelectedProvider,
  setShowProviderModal,
  setShowAddProviderModal,
  setShowEditProviderModal,
  setShowBecomeProviderModal,
  setEditingProvider,
  setPurchaseAmount,
  setProviderForm,
  setUserProviderForm,
  setWebDeleteConfirm,
  
  // Form error setter functions
  setAdminFormErrors,
  setUserFormErrors,
  
  // API configuration
  API_ORIGIN,
  API_BASE_URL,
  setApiStatus,
  setIsLoading,
  setElectricityProviders,
  
  // API functions
  checkApiConnection,
  fetchProviders,
  createProvider,
  updateProvider,
  deleteProvider,
  
  // Saved providers & alerts
  savedProviderIds,
  onToggleSaveProvider,
  onCreatePriceAlert,
  
  // Handler functions
  handlePurchase,
  handleAddProvider,
  handleEditProvider,
  handleDeleteProvider,
  confirmDeleteProvider,
  openEditModal,
  registerAsProvider,
  cancelProviderStatus,
  

  
  // Tab navigation
  setActiveTab,
  setNavigateToPersonal
}: MarketplaceTabProps) {
  console.log('MarketplaceTab rendered with activeTab:', activeTab);
  console.log('setActiveTab function available:', typeof setActiveTab);
  
  // Custom modal state for login required
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
  // Provider detail modal (only for logged-in users)
  const [showProviderDetail, setShowProviderDetail] = useState(false);
  const [detailProvider, setDetailProvider] = useState<any | null>(null);
  const formatDateTime = (raw: any): string => {
    if (!raw) return '—';
    try {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      }
    } catch {}
    return String(raw);
  };
  
  // Debug: Monitor modal state
  useEffect(() => {
    console.log('showLoginRequiredModal changed to:', showLoginRequiredModal);
  }, [showLoginRequiredModal]);
  
  // Debug: Monitor activeTab changes in this component
  useEffect(() => {
    console.log('MarketplaceTab useEffect - activeTab changed to:', activeTab);
  }, [activeTab]);
  
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
          <TouchableOpacity
            key={provider._id || provider.id || `${provider.name}-${index}`}
            style={styles.providerCard}
            activeOpacity={0.9}
            onPress={() => {
              if (loggedInUser) {
                setDetailProvider(provider);
                setShowProviderDetail(true);
              }
            }}
            disabled={!loggedInUser}
          >
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
                  
                  const providerId = provider._id || provider.id;
                  const isSaved = savedProviderIds.includes(providerId);
                  return (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {loggedInUser ? (
                        <>
                          <TouchableOpacity 
                            style={styles.buyButton}
                            onPress={() => {
                              setSelectedProvider(provider);
                              setShowProviderModal(true);
                            }}
                          >
                            <Text style={styles.buyButtonText}>Buy</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.smallButton, isSaved ? { backgroundColor: '#2E7D32' } : null]}
                            onPress={() => onToggleSaveProvider(provider)}
                          >
                            <Text style={[styles.smallButtonText, isSaved ? { color: '#fff' } : null]}>{isSaved ? 'Saved' : 'Save'}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.smallButton}
                            onPress={() => onCreatePriceAlert(provider)}
                          >
                            <Text style={styles.smallButtonText}>Alert</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <TouchableOpacity 
                          style={styles.buyButton}
                          onPress={() => setShowLoginRequiredModal(true)}
                        >
                          <Text style={styles.buyButtonText}>Login to Buy</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })()
              )}
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="business-outline" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>No providers available</Text>
          <Text style={styles.emptyStateSubtext}>Please check back later</Text>
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

      {isAdminMode && userPurchases.length > 0 && (
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

      {/* Provider Detail Modal (only when logged in) */}
      <Modal visible={!!loggedInUser && showProviderDetail} transparent animationType="fade" onRequestClose={() => setShowProviderDetail(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, width: '100%', padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="business" size={22} color="#2E7D32" />
              <Text style={{ fontSize: 18, fontWeight: '600', marginLeft: 8 }}>Provider Details</Text>
            </View>
            {detailProvider ? (
              <View>
                <View style={{ marginVertical: 6 }}>
                  <Text style={{ color: '#666', fontSize: 12 }}>Provider Name</Text>
                  <Text style={{ fontSize: 16 }}>{detailProvider.name}</Text>
                </View>
                <View style={{ marginVertical: 6 }}>
                  <Text style={{ color: '#666', fontSize: 12 }}>Type</Text>
                  <Text style={{ fontSize: 16 }}>{detailProvider.type}</Text>
                </View>
                <View style={{ marginVertical: 6 }}>
                  <Text style={{ color: '#666', fontSize: 12 }}>Price</Text>
                  <Text style={{ fontSize: 16 }}>${Number(detailProvider.price ?? 0).toFixed(2)}/kWh</Text>
                </View>
                <View style={{ marginVertical: 6 }}>
                  <Text style={{ color: '#666', fontSize: 12 }}>Rating</Text>
                  <Text style={{ fontSize: 16 }}>{detailProvider.rating}</Text>
                </View>
                <View style={{ marginVertical: 6 }}>
                  <Text style={{ color: '#666', fontSize: 12 }}>Available</Text>
                  <Text style={{ fontSize: 16 }}>{detailProvider.available} kWh</Text>
                </View>
                <View style={{ marginVertical: 6 }}>
                  <Text style={{ color: '#666', fontSize: 12 }}>Description</Text>
                  <Text style={{ fontSize: 16 }}>{detailProvider.description || '—'}</Text>
                </View>
                <View style={{ marginVertical: 6 }}>
                  <Text style={{ color: '#666', fontSize: 12 }}>Location</Text>
                  <Text style={{ fontSize: 16 }}>{detailProvider.location || detailProvider.city || '—'}</Text>
                </View>
                <View style={{ marginVertical: 6 }}>
                  <Text style={{ color: '#666', fontSize: 12 }}>Contact Email</Text>
                  <Text style={{ fontSize: 16 }}>{detailProvider.contactEmail || detailProvider.email || '—'}</Text>
                </View>
                <View style={{ marginVertical: 6 }}>
                  <Text style={{ color: '#666', fontSize: 12 }}>Contact Phone</Text>
                  <Text style={{ fontSize: 16 }}>{detailProvider.contactPhone || detailProvider.phone || '—'}</Text>
                </View>
                <View style={{ marginVertical: 6 }}>
                  <Text style={{ color: '#666', fontSize: 12 }}>Created At</Text>
                  <Text style={{ fontSize: 16 }}>{formatDateTime(detailProvider.createdAt || detailProvider.created_at)}</Text>
                </View>
              </View>
            ) : null}
            <TouchableOpacity style={{ marginTop: 12, backgroundColor: '#2E7D32', paddingVertical: 10, borderRadius: 8, alignItems: 'center' }} onPress={() => setShowProviderDetail(false)}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );

  return (
    <>
      {renderMarketplace()}
      
      {/* Purchase Modal */}
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

      {/* Login Required Modal */}
      <Modal
        visible={showLoginRequiredModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLoginRequiredModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Login Required</Text>
            <Text style={styles.modalSubtitle}>Please log in to make purchases.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowLoginRequiredModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={() => {
                  console.log('Login button in login required modal pressed, calling setNavigateToPersonal(true)');
                  console.log('setNavigateToPersonal function:', setNavigateToPersonal);
                  setNavigateToPersonal(true);
                  console.log('setNavigateToPersonal called with true');
                  setShowLoginRequiredModal(false);
                }}
              >
                <Text style={styles.confirmButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
