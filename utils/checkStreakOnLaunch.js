import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkStreakOnLaunch = async () => {
    try {
        const stored = await AsyncStorage.getItem('quiz-streak');

        // If streak is not set, initialize it
        if (!stored) {
            await AsyncStorage.setItem(
                'quiz-streak',
                JSON.stringify({ streak: 0, lastDate: null, streakStartDate: null })
            );
            __DEV__ && console.log('🌱 Streak initialized for first launch.');
            return;
        }

        let streakData;
        try {
            streakData = JSON.parse(stored);
        } catch (e) {
            __DEV__ && console.error('❌ Failed to parse streak data:', e);
            // Reset to avoid corrupt state
            await AsyncStorage.setItem(
                'quiz-streak',
                JSON.stringify({ streak: 0, lastDate: null, streakStartDate: null })
            );
            return;
        }

        const { lastDate } = streakData;
        const today = new Date().toISOString().split('T')[0];

        const yesterday = new Date();
        yesterday.setDate(new Date().getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Reset streak if the last recorded date is before yesterday
        if (lastDate && lastDate < yesterdayStr) {
            await AsyncStorage.setItem(
                'quiz-streak',
                JSON.stringify({ streak: 0, lastDate: null, streakStartDate: null })
            );
            __DEV__ && console.log('📉 Streak reset on launch due to inactivity.');
        } else {
            __DEV__ && console.log('🔥 Streak remains active.');
        }

    } catch (err) {
        __DEV__ && console.error('❌ Error checking streak on launch:', err);
    }
};