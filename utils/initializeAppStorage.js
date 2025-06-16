import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import {generateUUID} from './generateUUID';

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
            'user-tier': 'normal', // Default user tier
        };

        for (const key in defaults) {
            const existing = await AsyncStorage.getItem(key);
            if (existing === null) {
                await AsyncStorage.setItem(key, defaults[key]);
                console.log(`🗃️ Initialized ${key}`);
            }
        }
    } catch (err) {
        console.error('❌ Fail to initialize storage:', err);
    }
};
export async function initializeHashedApiKey(TIER) {
    const existingKey = await SecureStore.getItemAsync('api-key');
    if (existingKey) {
        const tier = existingKey.split('-')[0]; // Get the part before the first dash
        if (tier === TIER) {
            console.log('🔑 Existing API key matches tier:', existingKey);
            return existingKey; // Return existing key if it matches the current tier
        }
    }

    const rawKey = `${TIER}-${await generateUUID()}`;

    // Hash the raw key
    const hashed = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawKey
    );

    const finalKey = `${TIER}-${hashed}@thinkb`;

    await SecureStore.setItemAsync('api-key', finalKey);
    console.log('🔑 New hashed API key generated and stored:', finalKey);

    return finalKey;
}