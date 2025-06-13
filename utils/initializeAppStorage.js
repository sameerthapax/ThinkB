import AsyncStorage from '@react-native-async-storage/async-storage';

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
            }),
            'quiz-history': JSON.stringify([]),
            'study-materials': JSON.stringify([]),
        };

        for (const key in defaults) {
            const existing = await AsyncStorage.getItem(key);
            if (existing === null) {
                await AsyncStorage.setItem(key, defaults[key]);
                console.log(`🗃️ Initialized ${key}`);
            }
        }
    } catch (err) {
        console.error('❌ Failed to initialize storage:', err);
    }
};