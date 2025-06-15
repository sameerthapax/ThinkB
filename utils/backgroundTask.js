// backgroundtask.js
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateQuizFromText } from './generateQuiz';
import { parseQuizJson } from './parseQuiz';

export const TASK_NAME = 'reschedule-daily-reminder-task';

export const runBackgroundQuizGeneration = async () => {
    console.log('🧪 Triggering background task manually...');
    try {
        const settingsStr = await AsyncStorage.getItem('quiz-settings');
        if (!settingsStr) {
            console.log('⚠️ No settings found');
            return;
        }

        const settings = JSON.parse(settingsStr);
        if (!settings.reminderEnabled){
            console.log('🔕 Reminder is disabled in settings');
            return;
        }

        const stored = await AsyncStorage.getItem('study-materials');
        const materials = stored ? JSON.parse(stored) : [];
        console.log(`📚 Found ${materials.length} study materials for quiz generation.`);

        if (materials.length === 0) {
            console.log('📂 No study materials for quiz generation.');
            return;
        }

        const randomIndex = Math.floor(Math.random() * materials.length);
        const selectedMaterial = materials[randomIndex];
        console.log(`🔍 Selected material: ${selectedMaterial.fileName} (${selectedMaterial.text} characters)`);

        const todayStr = new Date().toISOString().split('T')[0];
        const quizKey = `quizAG-${todayStr}`;
        const existing = await AsyncStorage.getItem(quizKey);
        const userStatus = await AsyncStorage.getItem('user-tier') || 'normal';

        if (!existing) {

            const quiz = await generateQuizFromText(selectedMaterial.text, {
                numberOfQuestions: settings.quizLength || 5,
                difficulty: settings.difficulty || 'easy',
                generationMode: 'Auto',
            },null,userStatus
            );
            const parsedQuiz = parseQuizJson(quiz);
            await AsyncStorage.setItem('autoQuizShown', 'false');
            await AsyncStorage.setItem(quizKey, JSON.stringify(parsedQuiz));
            console.log(`✅ Quiz autgenerated and saved as ${quizKey}`);
        } else {
            console.log(`📦 Quiz already exists for today (${quizKey})`);
        }

        const reminderTime = new Date(settings.reminderTime);
        const nextReminder = new Date();
        nextReminder.setHours(reminderTime.getHours(), reminderTime.getMinutes(), 0, 0);
        if (nextReminder <= new Date()) nextReminder.setDate(nextReminder.getDate() + 1);

        await Notifications.cancelAllScheduledNotificationsAsync();
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Time to Study 🧠',
                body: 'Your daily ThinkB quiz is ready!',
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: nextReminder,
            },
        });

        console.log('🔁 Notification rescheduled for:', nextReminder.toString());
    } catch (err) {
        console.error('❌ Error in background quiz generation:', err);
    }
};

