import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles';

interface HistoryTabProps {
  electricityProviders: any[];
  userPurchases: any[];
  isAdminMode: boolean;
  onLogout: () => void;
}

export default function HistoryTab({ electricityProviders, userPurchases, isAdminMode, onLogout }: HistoryTabProps) {
  if (!isAdminMode) {
    return (
      <View style={styles.noDataCard}>
        <Text style={styles.noDataTitle}>Admin only</Text>
        <Text style={styles.noDataText}>Switch to an admin account to view history.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Recent Purchases */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Ionicons name="receipt" size={24} color="#2196F3" />
          <Text style={styles.sectionTitle}>Recent Purchases</Text>
          <Text style={styles.sectionCount}>({userPurchases.length})</Text>
        </View>
        {userPurchases.length > 0 ? (
          userPurchases.slice(-20).reverse().map((purchase, index) => (
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

      <TouchableOpacity style={styles.adminLogoutButton} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.adminLogoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}


