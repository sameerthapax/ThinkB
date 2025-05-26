import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TASK_NAME = 'reschedule-daily-reminder-task';

TaskManager.defineTask(TASK_NAME, async () => {
    try {
        const settingsStr = await AsyncStorage.getItem('quiz-settings');
        if (!settingsStr) return;

        const settings = JSON.parse(settingsStr);
        if (!settings.reminderEnabled) return;

        const reminderTime = new Date(settings.reminderTime);

        const nextReminder = new Date();
        nextReminder.setDate(nextReminder.getDate());
        nextReminder.setHours(reminderTime.getHours());
        nextReminder.setMinutes(reminderTime.getMinutes()+1);
        nextReminder.setSeconds(0);
        nextReminder.setMilliseconds(0);

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

        console.log('🔁 [BackgroundTask] Notification scheduled for:', nextReminder.toString());
    } catch (error) {
        console.error('❌ [BackgroundTask] Error:', error);
    }
});
