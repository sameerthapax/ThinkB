import AsyncStorage from '@react-native-async-storage/async-storage';

export const updateStreakAfterQuiz = async () => {
    try {
        const historyRaw = await AsyncStorage.getItem('quiz-history');
        const streakRaw = await AsyncStorage.getItem('quiz-streak');

        const history = historyRaw ? JSON.parse(historyRaw) : [];
        const streakData = streakRaw ? JSON.parse(streakRaw) : {
            streak: 0,
            lastDate: null,
            streakStartDate: null,
        };

        if (history.length === 0) {
            console.log('📉 No quiz history found.');
            await AsyncStorage.setItem('quiz-streak', JSON.stringify({
                streak: 1,
                lastDate: todayStr,
                streakStartDate: todayStr,
            }));
            return;
        }

        // 🧠 Today's Date
        const formatDate = (date) => date.toISOString().split('T')[0];
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const todayStr = formatDate(today);
        const yesterdayStr = formatDate(yesterday);

        // 🔎 Get latest quiz played
        const sorted = history.sort((a, b) =>
            new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
        );
        const latestQuiz = sorted[sorted.length - 1];
        const lastPlayedDate = latestQuiz.date;

        if (lastPlayedDate !== todayStr) {
            console.log('⚠️ Warning: Last played quiz is not today. Did you call this too early?');
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

        console.log(`🔥 Streak updated after quiz: ${newStreak}`);
    } catch (err) {
        console.error('❌ Failed to update streak after quiz:', err);
    }
};