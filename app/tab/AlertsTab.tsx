import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Modal, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
    loadPriceAlerts,
    loadSavedProviders,
    removePriceAlert,
    toggleSaveProvider as spToggleSaveProvider,
    upsertPriceAlert,
    type PriceAlert,
    type PriceAlertDirection,
    type SavedProvider
} from '../components/savedProviders';
import { styles } from '../styles';

interface AlertsTabProps {
  electricityProviders: any[];
  loggedInUser: 'admin' | 'user' | null;
  setSavedProviderIds: (ids: string[]) => void;
}

export default function AlertsTab({ electricityProviders, loggedInUser, setSavedProviderIds }: AlertsTabProps) {
  const [alerts, setAlerts] = React.useState<PriceAlert[]>([]);
  const [saved, setSaved] = React.useState<SavedProvider[]>([]);

  // Editor state
  const [showEditor, setShowEditor] = React.useState(false);
  const [editingAlert, setEditingAlert] = React.useState<PriceAlert | null>(null);
  const [editorProviderId, setEditorProviderId] = React.useState('');
  const [editorDirection, setEditorDirection] = React.useState<PriceAlertDirection>('price_below');
  const [editorTargetPrice, setEditorTargetPrice] = React.useState('');

  const loadAll = React.useCallback(async () => {
    try {
      const [a, s] = await Promise.all([loadPriceAlerts(), loadSavedProviders()]);
      setAlerts(a);
      setSaved(s);
      setSavedProviderIds(s.map(p => p.id));
    } catch {}
  }, [setSavedProviderIds]);

  React.useEffect(() => {
    if (loggedInUser) loadAll();
  }, [loggedInUser, loadAll]);

  const providerNameOf = (providerId: string) => {
    const p = electricityProviders.find(p => (p._id || p.id) === providerId);
    return p ? p.name : providerId;
  };

  const openCreateAlert = () => {
    setEditingAlert(null);
    setEditorProviderId('');
    setEditorDirection('price_below');
    setEditorTargetPrice('');
    setShowEditor(true);
  };

  const openEditAlert = (alert: PriceAlert) => {
    setEditingAlert(alert);
    setEditorProviderId(alert.providerId);
    setEditorDirection(alert.direction);
    setEditorTargetPrice(String(alert.targetPrice));
    setShowEditor(true);
  };

  const saveAlert = async () => {
    const num = parseFloat(editorTargetPrice);
    if (!editorProviderId) {
      Alert.alert('Validation', 'Select a provider');
      return;
    }
    if (isNaN(num) || num <= 0) {
      Alert.alert('Validation', 'Enter a valid target value');
      return;
    }
    try {
      await upsertPriceAlert({
        id: editingAlert?.id,
        providerId: editorProviderId,
        targetPrice: num,
        direction: editorDirection,
        enabled: editingAlert?.enabled ?? true
      });
      setShowEditor(false);
      setEditingAlert(null);
      await loadAll();
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
      await loadAll();
    } catch {}
  };

  const deleteAlert = async (alert: PriceAlert) => {
    Alert.alert('Delete Alert', 'Are you sure you want to delete this alert?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { try { await removePriceAlert(alert.id); await loadAll(); } catch {} } }
    ]);
  };

  const removeSavedProvider = async (item: SavedProvider) => {
    try {
      await spToggleSaveProvider({ id: item.id, name: item.name, type: item.type });
      await loadAll();
    } catch {
      Alert.alert('Error', 'Failed to remove saved provider');
    }
  };

  if (!loggedInUser) {
    return (
      <View style={styles.noDataCard}>
        <Text style={styles.noDataTitle}>Login required</Text>
        <Text style={styles.noDataText}>Please login to manage your alerts and saved providers.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Alerts Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Ionicons name="alert" size={24} color="#F44336" />
          <Text style={styles.sectionTitle}>My Alerts</Text>
          <Text style={styles.sectionCount}>({alerts.length})</Text>
        </View>
        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No alerts yet</Text>
            <Text style={styles.emptyStateSubtext}>Create an alert to be notified on price changes</Text>
          </View>
        ) : (
          alerts.map(a => (
            <View key={a.id} style={styles.providerListItem}>
              <View style={styles.providerListInfo}>
                <Text style={styles.providerListName}>{providerNameOf(a.providerId)}</Text>
                <Text style={styles.providerListType}>{a.direction === 'kwh_above' ? 'Notify when available kWh is more than' : 'Notify when price is below than'}</Text>
                <Text style={styles.providerListPrice}>{a.direction === 'kwh_above' ? `${a.targetPrice} kWh` : `$${a.targetPrice}/kWh`}</Text>
              </View>
              <View style={styles.providerListStats}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ marginRight: 8 }}>{a.enabled ? 'On' : 'Off'}</Text>
                  <Switch value={a.enabled} onValueChange={() => toggleEnabled(a)} />
                </View>
                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  <TouchableOpacity style={[styles.smallButton, { marginRight: 8 }]} onPress={() => openEditAlert(a)}>
                    <Text style={styles.smallButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.smallButton, { backgroundColor: '#F44336' }]} onPress={() => deleteAlert(a)}>
                    <Text style={[styles.smallButtonText, { color: '#fff' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
        <TouchableOpacity style={[styles.actionButton, { marginTop: 12 }]} onPress={openCreateAlert}>
          <Text style={styles.actionButtonText}>Add Alert</Text>
        </TouchableOpacity>
      </View>

      {/* Saved Providers Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Ionicons name="bookmark" size={24} color="#2E7D32" />
          <Text style={styles.sectionTitle}>Saved Providers</Text>
          <Text style={styles.sectionCount}>({saved.length})</Text>
        </View>
        {saved.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No saved providers</Text>
            <Text style={styles.emptyStateSubtext}>Save providers from the Marketplace tab</Text>
            <Text style={[styles.emptyStateSubtext, { marginTop: 6 }]}>Tip: tap a provider's Save button to add it here.</Text>
          </View>
        ) : (
          saved.map(s => (
            <View key={s.id} style={styles.providerListItem}>
              <View style={styles.providerListInfo}>
                <Text style={styles.providerListName}>{s.name}</Text>
                <Text style={styles.providerListType}>{s.type || 'Energy'} Provider</Text>
              </View>
              <View style={styles.providerListStats}>
                <TouchableOpacity style={[styles.smallButton, { backgroundColor: '#F44336' }]} onPress={() => removeSavedProvider(s)}>
                  <Text style={[styles.smallButtonText, { color: '#fff' }]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Editor modal */}
      <Modal visible={showEditor} transparent animationType="fade" onRequestClose={() => setShowEditor(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Price Alert</Text>
            <Text style={styles.modalSubtitle}>Select provider and target</Text>

            <Text style={styles.label}>Provider</Text>
            <ScrollView style={{ maxHeight: 160 }}>
              {electricityProviders.map((p: any) => {
                const id = p._id || p.id;
                if (!id) return null;
                const selected = id === editorProviderId;
                return (
                  <TouchableOpacity key={id} style={[styles.providerListItem, selected ? { borderColor: '#2E7D32', borderWidth: 1 } : null]} onPress={() => setEditorProviderId(id)}>
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
              <TouchableOpacity style={[styles.smallButton, editorDirection === 'price_below' ? { backgroundColor: '#2E7D32' } : { backgroundColor: '#ccc' }]} onPress={() => setEditorDirection('price_below')}>
                <Text style={[styles.smallButtonText, { color: '#fff' }]}>Price below than</Text>
              </TouchableOpacity>
              <View style={{ width: 8 }} />
              <TouchableOpacity style={[styles.smallButton, editorDirection === 'kwh_above' ? { backgroundColor: '#2E7D32' } : { backgroundColor: '#ccc' }]} onPress={() => setEditorDirection('kwh_above')}>
                <Text style={[styles.smallButtonText, { color: '#fff' }]}>kWh more than</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>{editorDirection === 'kwh_above' ? 'Target kWh (available)' : 'Target Price ($/kWh)'}</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={editorTargetPrice}
              onChangeText={setEditorTargetPrice}
              placeholder={editorDirection === 'kwh_above' ? 'e.g. 500' : 'e.g. 0.20'}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEditor(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={saveAlert}>
                <Text style={styles.confirmButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}


