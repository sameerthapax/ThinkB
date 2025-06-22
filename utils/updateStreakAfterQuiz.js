import AsyncStorage from '@react-native-async-storage/async-storage';

export const updateStreakAfterQuiz = async () => {
    try {
        // 🧠 Today's Date
        const formatDate = (date) => date.toISOString().split('T')[0];
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const todayStr = formatDate(today);
        const yesterdayStr = formatDate(yesterday);

        const historyRaw = await AsyncStorage.getItem('quiz-history');
        const streakRaw = await AsyncStorage.getItem('quiz-streak');

        let history = [];
        try {
            history = historyRaw ? JSON.parse(historyRaw) : [];
        } catch {
            __DEV__ && console.warn('⚠️ Corrupted quiz-history data. Resetting...');
            history = [];
        }

        let streakData = {
            streak: 0,
            lastDate: null,
            streakStartDate: null,
        };
        try {
            if (streakRaw) streakData = JSON.parse(streakRaw);
        } catch {
            __DEV__ && console.warn('⚠️ Corrupted streak data. Using defaults...');
        }

        if (history.length === 0) {
            __DEV__ && console.log('📉 No quiz history found.');
            await AsyncStorage.setItem('quiz-streak', JSON.stringify({
                streak: 1,
                lastDate: todayStr,
                streakStartDate: todayStr,
            }));
            return;
        }

        // 🔎 Get latest quiz played
        const sorted = history.sort((a, b) => {
            try {
                return new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`);
            } catch {
                return 0;
            }
        });
        const latestQuiz = sorted[sorted.length - 1];
        const lastPlayedDate = latestQuiz.date;

        if (!lastPlayedDate) {
            __DEV__ && console.warn('⚠️ Last played quiz has no date. Skipping streak update.');
            return;
        }

        if (streakData.lastDate === todayStr) {
            __DEV__ && console.log('✅ Streak already updated for today.');
            return;
        }

        if (lastPlayedDate !== todayStr) {
            __DEV__ && console.log('⚠️ Last quiz not from today. Possibly called too early.');
            return;
        }

        let newStreak = 1;
        let newStartDate = todayStr;

        if (streakData.lastDate === yesterdayStr && streakData.streakStartDate) {
            newStartDate = streakData.streakStartDate;
            const diffDays = Math.floor(
                (new Date(todayStr) - new Date(newStartDate)) / (1000 * 60 * 60 * 24)
            ) + 1;
            newStreak = diffDays;
        }

        await AsyncStorage.setItem('quiz-streak', JSON.stringify({
            streak: newStreak,
            lastDate: todayStr,
            streakStartDate: newStartDate,
        }));

        __DEV__ && console.log(`🔥 Streak updated: ${newStreak}`);
    } catch (err) {
        __DEV__ && console.error('❌ Failed to update streak after quiz:', err);
    }
};