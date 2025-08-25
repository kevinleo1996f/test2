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
  
  // API functions
  checkApiConnection: () => Promise<boolean>;
  fetchProviders: () => Promise<void>;
  createProvider: (providerData: any) => Promise<any>;
  updateProvider: (providerId: string, providerData: any) => Promise<any>;
  deleteProvider: (providerId: string) => Promise<boolean>;
  
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
  
  // API functions
  checkApiConnection,
  fetchProviders,
  createProvider,
  updateProvider,
  deleteProvider,
  
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
                        console.log('Login to Buy button pressed');
                        setShowLoginRequiredModal(true);
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
