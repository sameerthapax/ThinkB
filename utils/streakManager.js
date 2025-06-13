import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkStreak = async () => {
    try {
        const history = await AsyncStorage.getItem('quiz-history');
        const streakData = await AsyncStorage.getItem('quiz-streak');
        const historyItems = history ? JSON.parse(history) : [];
        const streakInfo = streakData ? JSON.parse(streakData) : { streak: 0, lastDate: null };

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const formatDate = (date) => date.toISOString().split('T')[0]; // YYYY-MM-DD
        const todayStr = formatDate(today);
        const yesterdayStr = formatDate(yesterday);

        if (historyItems.length === 0) {
            console.log('📉 No quiz history found.');
            await AsyncStorage.setItem('quiz-streak', JSON.stringify({ streak: 0, lastDate: null }));
            return;
        }

        const latest = historyItems[historyItems.length - 1];
        const lastPlayedDate = latest.date;

        if (lastPlayedDate === todayStr && streakInfo.streak === 0) {
            await AsyncStorage.setItem('quiz-streak', JSON.stringify({ streak: 1, lastDate: todayStr }));
            console.log('🔥 Streak started at 1!');
        } else if (lastPlayedDate === todayStr && streakInfo.streak > 0) {
            console.log('✅ Already counted today\'s streak');
        } else if (lastPlayedDate === yesterdayStr) {
            const updatedStreak = streakInfo.streak + 1;
            await AsyncStorage.setItem('quiz-streak', JSON.stringify({ streak: updatedStreak, lastDate: todayStr }));
            console.log(`🔥 Streak continued: ${updatedStreak}`);
        } else {
            await AsyncStorage.setItem('quiz-streak', JSON.stringify({ streak: 0, lastDate: null }));
            console.log('📉 Streak reset due to inactivity.');
        }
    } catch (err) {
        console.error('❌ Failed to check streak on launch:', err);
    }
};