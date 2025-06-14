import AsyncStorage from '@react-native-async-storage/async-storage';


export const checkStreakOnLaunch = async () => {
    const stored = await AsyncStorage.getItem('quiz-streak');
    if (!stored) {
        await AsyncStorage.setItem('quiz-streak', JSON.stringify({ streak: 0, lastDate: null, streakStartDate: null }));
        return;
    }

    const { lastDate } = JSON.parse(stored);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(new Date().getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastDate && lastDate < yesterdayStr) {
        await AsyncStorage.setItem('quiz-streak', JSON.stringify({ streak: 0, lastDate: null, streakStartDate: null }));
        console.log('📉 Streak reset on launch due to missed day');
    }
};