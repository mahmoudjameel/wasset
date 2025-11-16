import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface FeatureFlags {
  financialFeaturesEnabled: boolean;
  transactionsEnabled: boolean;
  walletEnabled: boolean;
  subscriptionsEnabled: boolean;
  matchesEnabled: boolean;
  trialBannerEnabled: boolean;
  lastUpdated?: any;
}

const COLLECTION = 'featureFlags';
const DOCUMENT_ID = 'settings';

const DEFAULT_FLAGS: FeatureFlags = {
  financialFeaturesEnabled: false,
  transactionsEnabled: false,
  walletEnabled: false,
  subscriptionsEnabled: false,
  matchesEnabled: false,
  trialBannerEnabled: false,
};

/**
 * جلب Feature Flags من Firestore
 */
export async function getFeatureFlags(): Promise<FeatureFlags> {
  try {
    const docRef = doc(db, COLLECTION, DOCUMENT_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        financialFeaturesEnabled: data.financialFeaturesEnabled ?? false,
        transactionsEnabled: data.transactionsEnabled ?? false,
        walletEnabled: data.walletEnabled ?? false,
        subscriptionsEnabled: data.subscriptionsEnabled ?? false,
        matchesEnabled: data.matchesEnabled ?? false,
        trialBannerEnabled: data.trialBannerEnabled ?? false,
        lastUpdated: data.lastUpdated,
      };
    } else {
      // إنشاء document جديد بالقيم الافتراضية
      await initializeFeatureFlags();
      return DEFAULT_FLAGS;
    }
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    throw error;
  }
}

/**
 * تحديث Feature Flags في Firestore
 */
export async function updateFeatureFlags(updates: Partial<FeatureFlags>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION, DOCUMENT_ID);
    const docSnap = await getDoc(docRef);

    const updateData: any = {
      ...updates,
      lastUpdated: serverTimestamp(),
    };

    if (docSnap.exists()) {
      await setDoc(docRef, updateData, { merge: true });
    } else {
      // إنشاء document جديد
      await setDoc(docRef, {
        ...DEFAULT_FLAGS,
        ...updateData,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error updating feature flags:', error);
    throw error;
  }
}

/**
 * تهيئة Feature Flags document لأول مرة
 */
export async function initializeFeatureFlags(): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION, DOCUMENT_ID);
    await setDoc(docRef, {
      ...DEFAULT_FLAGS,
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error initializing feature flags:', error);
    throw error;
  }
}
