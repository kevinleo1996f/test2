import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { styles } from '../styles';

interface StorageTabProps {
  // Storage calculator state
  storageCapacity: string;
  dailyUsage: string;
  setStorageCapacity: (capacity: string) => void;
  setDailyUsage: (usage: string) => void;
  
  // Solar panel calculator state
  solarDailyUsage: string;
  solarSunHours: string;
  solarPanelCost: string;
  solarInstallCost: string;
  setSolarDailyUsage: (usage: string) => void;
  setSolarSunHours: (hours: string) => void;
  setSolarPanelCost: (cost: string) => void;
  setSolarInstallCost: (cost: string) => void;
  
  // Tab selection
  storageTab: 'storage' | 'solar';
  setStorageTab: (tab: 'storage' | 'solar') => void;
  
  // Calculation results
  storageCost: any;
  solarResult: any;
}

export default function StorageTab({
  // Storage calculator state
  storageCapacity,
  dailyUsage,
  setStorageCapacity,
  setDailyUsage,
  
  // Solar panel calculator state
  solarDailyUsage,
  solarSunHours,
  solarPanelCost,
  solarInstallCost,
  setSolarDailyUsage,
  setSolarSunHours,
  setSolarPanelCost,
  setSolarInstallCost,
  
  // Tab selection
  storageTab,
  setStorageTab,
  
  // Calculation results
  storageCost,
  solarResult
}: StorageTabProps) {
  
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
              <Text style={styles.resultsTitle}>Cost Analysis</Text>
              <Text style={styles.resultsText}>Battery Cost: ${storageCost.batteryCost}</Text>
              <Text style={styles.resultsText}>Installation: ${storageCost.installationCost}</Text>
              <Text style={styles.resultsText}>Total Cost: ${storageCost.totalCost}</Text>
              <Text style={styles.resultsText}>Monthly Savings: ${storageCost.monthlySavings}</Text>
              <Text style={styles.resultsText}>Payback Period: {storageCost.paybackYears} years</Text>
            </View>
          )}
        </View>
      )}

      {/* Solar Panel Calculator */}
      {storageTab === 'solar' && (
        <View style={styles.calculatorCard}>
          <Text style={styles.sectionTitle}>Solar Panel Calculator</Text>
          <Text style={styles.sectionSubtitle}>Calculate the cost and benefits of installing solar panels.</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Daily Energy Usage (kWh)</Text>
            <TextInput
              style={styles.input}
              value={solarDailyUsage}
              onChangeText={setSolarDailyUsage}
              placeholder="Enter daily usage (e.g., 20)"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sun Hours per Day</Text>
            <TextInput
              style={styles.input}
              value={solarSunHours}
              onChangeText={setSolarSunHours}
              placeholder="Average sun hours (e.g., 5)"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Panel Cost per kW ($)</Text>
            <TextInput
              style={styles.input}
              value={solarPanelCost}
              onChangeText={setSolarPanelCost}
              placeholder="Cost per kW (e.g., 1200)"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Installation Cost ($)</Text>
            <TextInput
              style={styles.input}
              value={solarInstallCost}
              onChangeText={setSolarInstallCost}
              placeholder="Installation cost (e.g., 2000)"
              keyboardType="numeric"
            />
          </View>
          {solarResult && (
            <View style={styles.resultsCard}>
              <Text style={styles.resultsTitle}>Solar Analysis</Text>
              <Text style={styles.resultsText}>System Size: {solarResult.systemSize} kW</Text>
              <Text style={styles.resultsText}>Total Cost: ${solarResult.totalCost}</Text>
              <Text style={styles.resultsText}>Monthly Savings: ${solarResult.monthlySavings}</Text>
              <Text style={styles.resultsText}>Payback Period: {solarResult.paybackYears} years</Text>
              <Text style={styles.resultsText}>CO2 Saved: {solarResult.co2Saved} tons/year</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );

  return renderStorageCalculator();
}
