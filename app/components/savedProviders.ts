// Saved providers and price alerts utilities (mobile-friendly, side-effect free)
// Storage: AsyncStorage

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const SAVED_PROVIDERS_KEY = 'powergrid.savedProviders.v1';
const PRICE_ALERTS_KEY = 'powergrid.priceAlerts.v1';

// Types
export type SavedProvider = {
  id: string; // provider _id or id
  name: string;
  type?: string;
};

export type PriceAlertDirection = 'price_below' | 'kwh_above';

export type PriceAlert = {
  id: string; // alert id
  providerId: string;
  targetPrice: number; // used for price ($/kWh) or kWh threshold depending on direction
  direction: PriceAlertDirection; // 'price_below' or 'kwh_above'
  enabled: boolean;
};

export type ProviderSummary = {
  _id?: string;
  id?: string;
  name: string;
  price: number; // price/kWh
  available?: number; // kWh available (optional but used for kwh_above)
};

// Helpers
const safeJsonParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

// Saved providers API
export async function loadSavedProviders(): Promise<SavedProvider[]> {
  const raw = await AsyncStorage.getItem(SAVED_PROVIDERS_KEY);
  return safeJsonParse<SavedProvider[]>(raw, []);
}

export async function saveSavedProviders(list: SavedProvider[]): Promise<void> {
  await AsyncStorage.setItem(SAVED_PROVIDERS_KEY, JSON.stringify(list));
}

export async function isProviderSaved(providerId: string): Promise<boolean> {
  const list = await loadSavedProviders();
  return list.some(p => p.id === providerId);
}

export async function toggleSaveProvider(provider: { id?: string; _id?: string; name: string; type?: string }): Promise<{ saved: boolean; list: SavedProvider[] }> {
  const id = provider._id || provider.id;
  if (!id) throw new Error('toggleSaveProvider: provider id is required');
  const current = await loadSavedProviders();
  const exists = current.some(p => p.id === id);
  const next = exists
    ? current.filter(p => p.id !== id)
    : [...current, { id, name: provider.name, type: provider.type }];
  await saveSavedProviders(next);
  return { saved: !exists, list: next };
}

// Price alerts API
export async function loadPriceAlerts(): Promise<PriceAlert[]> {
  const raw = await AsyncStorage.getItem(PRICE_ALERTS_KEY);
  return safeJsonParse<PriceAlert[]>(raw, []);
}

export async function savePriceAlerts(list: PriceAlert[]): Promise<void> {
  await AsyncStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(list));
}

export async function upsertPriceAlert(alert: Omit<PriceAlert, 'id'> & { id?: string }): Promise<PriceAlert[]> {
  const list = await loadPriceAlerts();
  const id = alert.id ?? `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const idx = list.findIndex(a => a.id === id);
  const next: PriceAlert = { id, providerId: alert.providerId, targetPrice: alert.targetPrice, direction: alert.direction, enabled: alert.enabled };
  if (idx >= 0) list[idx] = next; else list.push(next);
  await savePriceAlerts(list);
  return list;
}

export async function removePriceAlert(id: string): Promise<PriceAlert[]> {
  const list = await loadPriceAlerts();
  const next = list.filter(a => a.id !== id);
  await savePriceAlerts(next);
  return next;
}

// Alert evaluation
export type AlertMatch = {
  alert: PriceAlert;
  provider: ProviderSummary;
};

export function evaluateAlert(alert: PriceAlert, provider: ProviderSummary): boolean {
  if (!alert.enabled) return false;
  if (alert.direction === 'price_below') {
    const currentPrice = provider.price;
    return currentPrice <= alert.targetPrice;
  }
  if (alert.direction === 'kwh_above') {
    const currentAvail = typeof provider.available === 'number' ? provider.available : 0;
    return currentAvail >= alert.targetPrice;
  }
  return false;
}

export function checkAlerts(providers: ProviderSummary[], alerts: PriceAlert[]): AlertMatch[] {
  const idOf = (p: ProviderSummary) => p._id || p.id || '';
  const providerMap = new Map<string, ProviderSummary>();
  providers.forEach(p => providerMap.set(idOf(p), p));
  const matches: AlertMatch[] = [];
  for (const alert of alerts) {
    const provider = providerMap.get(alert.providerId);
    if (!provider) continue;
    if (evaluateAlert(alert, provider)) {
      matches.push({ alert, provider });
    }
  }
  return matches;
}

// Lightweight subscriber system (optional)
export type AlertsSubscriber = (matches: AlertMatch[]) => void;
const subscribers = new Set<AlertsSubscriber>();

export function subscribeAlerts(listener: AlertsSubscriber): () => void {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

export async function checkAlertsAndNotify(providers: ProviderSummary[]): Promise<AlertMatch[]> {
  const alerts = await loadPriceAlerts();
  const matches = checkAlerts(providers, alerts);
  if (matches.length > 0) {
    subscribers.forEach(fn => {
      try { fn(matches); } catch { /* no-op */ }
    });
  }
  return matches;
}

// Convenience: clear all (useful for testing)
export async function clearAllSavedAndAlerts(): Promise<void> {
  await AsyncStorage.multiRemove([SAVED_PROVIDERS_KEY, PRICE_ALERTS_KEY]);
}


