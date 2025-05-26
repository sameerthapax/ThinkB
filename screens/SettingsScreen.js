import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Alert } from 'react-native';
import { Text, Title, Switch, Button, SegmentedButtons } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {getAllScheduledNotificationsAsync} from "expo-notifications";

export default function SettingsScreen() {
    const [quizLength, setQuizLength] = useState(10);
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState(new Date(new Date().setHours(18, 0, 0)));
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [difficulty, setDifficulty] = useState('medium');
    const [settingsLoaded, setSettingsLoaded] = useState(false);

    useEffect(() => {
        (async () => {
            const stored = await AsyncStorage.getItem('quiz-settings');
            if (stored) {
                const settings = JSON.parse(stored);
                setQuizLength(settings.quizLength);
                setReminderEnabled(settings.reminderEnabled);
                setReminderTime(new Date(settings.reminderTime));
                setDifficulty(settings.difficulty);
            }
            setSettingsLoaded(true);
        })();
    }, []);

    useEffect(() => {
        if (!settingsLoaded) return;
        const saveSettings = async () => {
            const settings = {
                quizLength,
                reminderEnabled,
                reminderTime,
                difficulty,
            };
            await AsyncStorage.setItem('quiz-settings', JSON.stringify(settings));
        };
        saveSettings();
    }, [quizLength, reminderEnabled, reminderTime, difficulty]);

    useEffect(() => {
        if (!settingsLoaded) return;

        const updateReminder = async () => {
            if (reminderEnabled) {
                await scheduleDailyReminder(reminderTime);
            } else {
                await Notifications.cancelAllScheduledNotificationsAsync();
            }
        };

        updateReminder();
    }, [reminderEnabled, reminderTime]);

    const onTimeSelected = (event, selectedTime) => {
        setShowTimePicker(false);
        if (selectedTime) {
            const updatedTime = new Date();
            updatedTime.setHours(selectedTime.getHours());
            updatedTime.setMinutes(selectedTime.getMinutes());
            updatedTime.setSeconds(0);
            updatedTime.setMilliseconds(0);
            setReminderTime(updatedTime);
        }
    };

    const scheduleDailyReminder = async (time) => {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();

            const permission = await Notifications.requestPermissionsAsync();
            if (!permission.granted && permission.status !== 'granted') {
                Alert.alert('Permission Required', 'Please enable notifications to receive reminders.');
                return;
            }

            // Construct next trigger time using selected hour/minute
            const now = new Date();
            const date = new Date(Date.now());
            date.setHours(time.getHours());
            date.setMinutes(time.getMinutes());
            date.setSeconds(0);
            date.setMilliseconds(0);

            // If the time has already passed today, schedule for tomorrow
            if (date <= now) {
                date.setDate(date.getDate() + 1);
            }

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Time to Study 🧠',
                    body: 'Your daily ThinkB quiz is ready!',
                    sound: true,

                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DAILY,
                    hour: date.getHours(),
                    minute: date.getMinutes(),
                    repeats: true,

                },
            });


            console.log('Notification scheduled for:', date.toString());
            const notificationLog =await getAllScheduledNotificationsAsync()
            console.log('All Scheduled Notifications:', notificationLog);
        } catch (err) {
            console.error('❌ Failed to schedule daily reminder:', err);
        }
    };



    return (
        <View style={styles.container}>
            <Title style={styles.title}>Quiz Settings</Title>

            <Text style={styles.label}>Number of Questions: {quizLength}</Text>
            <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={5}
                maximumValue={20}
                step={5}
                value={quizLength}
                onValueChange={setQuizLength}
                minimumTrackTintColor="#6200ee"
                maximumTrackTintColor="#ddd"
            />

            <Text style={styles.label}>Difficulty</Text>
            <SegmentedButtons
                value={difficulty}
                onValueChange={setDifficulty}
                buttons={[
                    { value: 'easy', label: 'Easy' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'hard', label: 'Hard' },
                ]}
             multiSelect/>

            <View style={styles.settingRow}>
                <Text style={styles.label}>Enable Reminder</Text>
                <Switch value={reminderEnabled} onValueChange={setReminderEnabled} />
            </View>

            {reminderEnabled && (
                <View style={styles.settingRow}>
                    <Text style={styles.label}>
                        Reminder Time: {reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Button mode="outlined" onPress={() => setShowTimePicker(true)}>Change Time</Button>
                </View>
            )}

            {showTimePicker && (
                <DateTimePicker
                    value={reminderTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onTimeSelected}
                />
            )}

        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        marginBottom: 10,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 15,
    },
});
