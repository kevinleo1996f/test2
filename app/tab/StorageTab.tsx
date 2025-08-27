import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Animated,
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
  
  // Small animations for header accent
  const pulse = React.useRef(new Animated.Value(1)).current;
  const floatY = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 900, useNativeDriver: true })
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -4, duration: 1000, useNativeDriver: true }),
        Animated.timing(floatY, { toValue: 0, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  }, [pulse, floatY]);

  // Electricity-themed flicker for small lightning row
  const flicker1 = React.useRef(new Animated.Value(0.4)).current;
  const flicker2 = React.useRef(new Animated.Value(0.4)).current;
  const flicker3 = React.useRef(new Animated.Value(0.4)).current;
  React.useEffect(() => {
    const makeFlicker = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 1, duration: 250, delay, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0.4, duration: 400, useNativeDriver: true })
        ])
      ).start();
    makeFlicker(flicker1, 0);
    makeFlicker(flicker2, 120);
    makeFlicker(flicker3, 240);
  }, [flicker1, flicker2, flicker3]);

  const renderStorageCalculator = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Info Card and Segmented Control */}
      <View style={styles.infoCard}>
        <View style={{ backgroundColor: '#E8F5E9', borderRadius: 12, padding: 12, width: '100%', marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Animated.View style={{ transform: [{ scale: pulse }, { translateY: floatY }], shadowColor: '#2E7D32', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }}>
              <Ionicons name="battery-charging" size={36} color="#2E7D32" />
            </Animated.View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.infoTitle}>Energy Solutions</Text>
              <Text style={styles.infoSubtitle}>Estimate your savings and payback for storing or generating your own electricity.</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center', justifyContent: 'flex-start' }}>
            <Animated.View style={{ opacity: flicker1 }}>
              <Ionicons name="flash" size={18} color="#2E7D32" />
            </Animated.View>
            <Animated.View style={{ opacity: flicker2, marginLeft: 6 }}>
              <Ionicons name="flash" size={18} color="#2E7D32" />
            </Animated.View>
            <Animated.View style={{ opacity: flicker3, marginLeft: 6 }}>
              <Ionicons name="flash" size={18} color="#2E7D32" />
            </Animated.View>
          </View>
        </View>
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
              <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#2E7D32', marginRight: 8 }}>Energy pulse</Text>
                <Animated.View style={{ opacity: flicker1 }}>
                  <Ionicons name="flash" size={16} color="#2E7D32" />
                </Animated.View>
                <Animated.View style={{ opacity: flicker2, marginLeft: 4 }}>
                  <Ionicons name="flash" size={16} color="#2E7D32" />
                </Animated.View>
                <Animated.View style={{ opacity: flicker3, marginLeft: 4 }}>
                  <Ionicons name="flash" size={16} color="#2E7D32" />
                </Animated.View>
              </View>
            </View>
          )}

          {/* Recommendations based on inputs */}
          {dailyUsage && storageCapacity ? (
            <View style={[styles.resultsCard, { marginTop: 10 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="flash-outline" size={18} color="#2E7D32" />
                <Text style={{ marginLeft: 6, fontWeight: '600', color: '#2E7D32' }}>Recommendation</Text>
              </View>
              {(() => {
                const usage = Math.max(0, Number(dailyUsage) || 0);
                const cap = Math.max(0, Number(storageCapacity) || 0);
                if (usage > 0) {
                  const recommended = Math.round(usage * 1.5 * 10) / 10; // 1.5x daily usage
                  const daysCovered = usage > 0 ? Math.round((cap / usage) * 10) / 10 : 0;
                  return (
                    <>
                      <Text style={styles.resultsText}>Suggested capacity: {recommended} kWh (≈ 1.5× daily)</Text>
                      <Text style={styles.resultsText}>Your current setup covers ~{daysCovered} days</Text>
                      {storageCost?.paybackYears ? (
                        <Text style={styles.resultsText}>Estimated payback: {storageCost.paybackYears} years</Text>
                      ) : null}
                    </>
                  );
                }
                return <Text style={styles.resultsText}>Enter your daily usage to see suggestions.</Text>;
              })()}
            </View>
          ) : null}
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
              <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#2E7D32', marginRight: 8 }}>Solar flux</Text>
                <Animated.View style={{ opacity: flicker1 }}>
                  <Ionicons name="flash" size={16} color="#2E7D32" />
                </Animated.View>
                <Animated.View style={{ opacity: flicker2, marginLeft: 4 }}>
                  <Ionicons name="flash" size={16} color="#2E7D32" />
                </Animated.View>
                <Animated.View style={{ opacity: flicker3, marginLeft: 4 }}>
                  <Ionicons name="flash" size={16} color="#2E7D32" />
                </Animated.View>
              </View>
            </View>
          )}

          {/* Recommendations based on inputs */}
          {solarDailyUsage && solarSunHours ? (
            <View style={[styles.resultsCard, { marginTop: 10 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="sunny-outline" size={18} color="#2E7D32" />
                <Text style={{ marginLeft: 6, fontWeight: '600', color: '#2E7D32' }}>Recommendation</Text>
              </View>
              {(() => {
                const usage = Math.max(0, Number(solarDailyUsage) || 0);
                const hours = Math.max(0.1, Number(solarSunHours) || 0);
                if (usage > 0 && hours > 0) {
                  const suggestedSize = Math.round((usage / hours) * 10) / 10; // kW
                  return (
                    <>
                      <Text style={styles.resultsText}>Suggested system size: {suggestedSize} kW (usage ÷ sun hours)</Text>
                      {typeof solarResult?.systemSize === 'number' ? (
                        <Text style={styles.resultsText}>Calculated size: {solarResult.systemSize} kW</Text>
                      ) : null}
                    </>
                  );
                }
                return <Text style={styles.resultsText}>Enter usage and sun hours to see suggestions.</Text>;
              })()}
            </View>
          ) : null}
        </View>
      )}

      {/* Helpful info footer */}
      <View style={{ marginTop: 16, marginBottom: 24, backgroundColor: '#F5FDF6', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E0F2E9' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <Ionicons name="bulb" size={22} color="#2E7D32" />
          </Animated.View>
          <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#2E7D32' }}>Tips</Text>
        </View>
        <Text style={{ color: '#2E7D32' }}>• Storage: aim for 1–2 days of your average usage in kWh.</Text>
        <Text style={{ color: '#2E7D32', marginTop: 6 }}>• Solar: higher sun hours reduce system size and payback time.</Text>
        <Text style={{ color: '#2E7D32', marginTop: 6 }}>• Revisit your inputs monthly as seasons and usage patterns change.</Text>
      </View>
    </ScrollView>
  );

  return renderStorageCalculator();
}
