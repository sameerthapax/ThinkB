import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { generateUUID } from './generateUUID';

// Safely initialize AsyncStorage defaults
export const initializeAppStorage = async () => {
    try {
        const defaults = {
            'quiz-settings': JSON.stringify({
                quizLength: 5,
                reminderEnabled: false,
                reminderTime: new Date(new Date().setHours(18, 0, 0)).toISOString(),
                difficulty: 'easy',
            }),
            'quiz-streak': JSON.stringify({
                streak: 0,
                lastDate: null,
                streakStartDate: null,
            }),
            'quiz-history': JSON.stringify([]),
            'study-materials': JSON.stringify([]),
            'user-tier': 'normal',
        };

        for (const key in defaults) {
            try {
                const existing = await AsyncStorage.getItem(key);
                if (existing === null) {
                    await AsyncStorage.setItem(key, defaults[key]);
                    __DEV__ && console.log(`🗃️ Initialized ${key}`);
                }
            } catch (innerErr) {
                __DEV__ && console.error(`❌ Failed initializing key "${key}":`, innerErr);
            }
        }
    } catch (err) {
        __DEV__ && console.error('❌ Failed to initialize storage:', err);
    }
};

// Generate and store a hashed API key securely
export async function initializeHashedApiKey(TIER) {
    try {
        const existingKey = await SecureStore.getItemAsync('api-key');
        if (existingKey) {
            const tier = existingKey.split('-')[0];
            if (tier === TIER) {
                __DEV__ && console.log('🔑 Existing API key matches tier:', existingKey);
                return existingKey;
            }
        }

        const uuid = await generateUUID();
        if (!uuid) {
            throw new Error('Failed to generate UUID');
        }

        const rawKey = `${TIER}-${uuid}`;
        const hashed = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            rawKey
        );

        const finalKey = `${TIER}-${hashed}@thinkb`;
        await SecureStore.setItemAsync('api-key', finalKey);
        __DEV__ && console.log('🔑 New hashed API key generated and stored:', finalKey);

        return finalKey;
    } catch (err) {
        __DEV__ && console.error('❌ Failed to initialize hashed API key:', err);
        return null;
    }
}