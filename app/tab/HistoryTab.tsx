import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles';

interface HistoryTabProps {
  electricityProviders: any[];
  userPurchases: any[];
  isAdminMode: boolean;
  onLogout: () => void;
}

function resolveProviderName(purchase: any, providers: any[]): string {
  const direct = purchase.provider || purchase.providerName || purchase.provider_name || purchase.name;
  if (direct) return String(direct);
  const providerId = purchase.providerId || purchase.provider_id || purchase.providerID || purchase.providerRef;
  if (!providerId) return 'Unknown Provider';
  const match = providers.find((pr: any) => (pr._id || pr.id) === providerId || pr.name === providerId);
  return match?.name || String(providerId);
}

function resolveDate(purchase: any): string {
  const raw = purchase.date || purchase.createdAt || purchase.created_at || purchase.timestamp || purchase.time;
  if (!raw) return '—';
  try {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch {}
  return String(raw);
}

function resolveType(purchase: any): string {
  return purchase.type || purchase.status || '—';
}

function resolveTimestamp(purchase: any): number {
  const raw = purchase.date || purchase.createdAt || purchase.created_at || purchase.timestamp || purchase.time;
  const t = Date.parse(raw);
  return isNaN(t) ? 0 : t;
}

export default function HistoryTab({ electricityProviders, userPurchases, isAdminMode, onLogout }: HistoryTabProps) {
  const [selectedPurchase, setSelectedPurchase] = React.useState<any | null>(null);
  const [showDetail, setShowDetail] = React.useState(false);

  const openDetail = (purchase: any) => {
    setSelectedPurchase(purchase);
    setShowDetail(true);
  };

  const closeDetail = () => {
    setShowDetail(false);
    setSelectedPurchase(null);
  };
  if (!isAdminMode) {
    return (
      <View style={styles.noDataCard}>
        <Text style={styles.noDataTitle}>Admin only</Text>
        <Text style={styles.noDataText}>Switch to an admin account to view history.</Text>
      </View>
    );
  }

  const sortedPurchases = [...userPurchases]
    .sort((a, b) => resolveTimestamp(b) - resolveTimestamp(a))
    .slice(0, 20);

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Recent Purchases */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Ionicons name="receipt" size={24} color="#2196F3" />
          <Text style={styles.sectionTitle}>Recent Purchases</Text>
          <Text style={styles.sectionCount}>({userPurchases.length})</Text>
        </View>
        {sortedPurchases.length > 0 ? (
          sortedPurchases.map((purchase, index) => {
            const providerName = resolveProviderName(purchase, electricityProviders);
            const dateStr = resolveDate(purchase);
            const costNum = Number(purchase.cost ?? 0);
            return (
              <TouchableOpacity key={purchase.id || purchase._id || `purchase-${index}`} style={styles.purchaseListItem} onPress={() => openDetail(purchase)}>
                <View style={styles.purchaseListInfo}>
                  <Text style={styles.purchaseListProvider}>{providerName}</Text>
                  <Text style={styles.purchaseListDate}>{dateStr}</Text>
                  <Text style={styles.purchaseListAmount}>{purchase.amount} kWh</Text>
                </View>
                <View style={styles.purchaseListStats}>
                  <Text style={styles.purchaseListCost}>${isNaN(costNum) ? '0.00' : costNum.toFixed(2)}</Text>
                  <Text style={styles.purchaseListStatus}>
                    {purchase.status === 'local' ? '🔄 Local' : '✅ Complete'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No purchases yet</Text>
            <Text style={styles.emptyStateSubtext}>Purchases will appear here</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.adminLogoutButton} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.adminLogoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Detail Modal */}
      <Modal visible={showDetail} transparent animationType="fade" onRequestClose={closeDetail}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, width: '100%', padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="receipt" size={22} color="#2196F3" />
              <Text style={{ fontSize: 18, fontWeight: '600', marginLeft: 8 }}>Purchase Details</Text>
            </View>
            {selectedPurchase ? (
              <View>
                <View style={{ marginVertical: 6 }}>
                  <Text style={{ color: '#666', fontSize: 12 }}>User ID</Text>
                  <Text style={{ fontSize: 16 }}>{selectedPurchase.userId || selectedPurchase.user || '—'}</Text>
                </View>
                <View style={{ marginVertical: 6 }}>
                  <Text style={{ color: '#666', fontSize: 12 }}>Provider</Text>
                  <Text style={{ fontSize: 16 }}>{resolveProviderName(selectedPurchase, electricityProviders)}</Text>
                </View>
                <View style={{ marginVertical: 6 }}>
                  <Text style={{ color: '#666', fontSize: 12 }}>Amount</Text>
                  <Text style={{ fontSize: 16 }}>{selectedPurchase.amount} kWh</Text>
                </View>
                <View style={{ marginVertical: 6 }}>
                  <Text style={{ color: '#666', fontSize: 12 }}>Cost</Text>
                  <Text style={{ fontSize: 16 }}>${(Number(selectedPurchase.cost ?? 0)).toFixed(2)}</Text>
                </View>
                <View style={{ marginVertical: 6 }}>
                  <Text style={{ color: '#666', fontSize: 12 }}>Type</Text>
                  <Text style={{ fontSize: 16 }}>{resolveType(selectedPurchase)}</Text>
                </View>
                <View style={{ marginVertical: 6 }}>
                  <Text style={{ color: '#666', fontSize: 12 }}>Date</Text>
                  <Text style={{ fontSize: 16 }}>{resolveDate(selectedPurchase)}</Text>
                </View>
              </View>
            ) : null}
            <TouchableOpacity style={{ marginTop: 12, backgroundColor: '#2196F3', paddingVertical: 10, borderRadius: 8, alignItems: 'center' }} onPress={closeDetail}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}


