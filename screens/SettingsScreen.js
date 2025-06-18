import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, StyleSheet, Platform, Alert, Linking, Pressable } from 'react-native';
import { Title, Switch, SegmentedButtons } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text, Button, Icon } from '@ui-kitten/components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { getAllScheduledNotificationsAsync } from 'expo-notifications';

import { SubscriptionContext } from '../context/SubscriptionContext';

export default function SettingsScreen() {
    const navigation = useNavigation();
    const { isProUser, isAdvancedUser, refresh} = useContext(SubscriptionContext);

    const [quizLength, setQuizLength] = useState(5);
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState(new Date(new Date().setHours(18, 0, 0)));
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [difficulty, setDifficulty] = useState('easy');
    const [settingsLoaded, setSettingsLoaded] = useState(false);


    useEffect(() => {
        (async () => {
            try {
                const stored = await AsyncStorage.getItem('quiz-settings');
                if (stored) {
                    const settings = JSON.parse(stored);
                    setQuizLength(settings.quizLength);
                    setReminderEnabled(settings.reminderEnabled);
                    setReminderTime(new Date(settings.reminderTime));
                    setDifficulty(settings.difficulty);
                }
                setSettingsLoaded(true);
            } catch (error) {
                console.error('❌ Failed to load quiz-settings:', error);
            }
        })();
    }, []);

    useEffect(() => {
        if (!settingsLoaded) return;

        const saveSettings = async () => {
            const settings = { quizLength, reminderEnabled, reminderTime, difficulty };
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
            if (!permission.granted) {
                Alert.alert('Permission Required', 'Please enable notifications to receive reminders.');
                return;
            }

            const now = new Date();
            const date = new Date();
            date.setHours(time.getHours(), time.getMinutes(), 0, 0);
            if (date <= now) date.setDate(date.getDate() + 1);

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

            const log = await getAllScheduledNotificationsAsync();
            console.log('🔔 Notification Scheduled:', log);
        } catch (err) {
            console.error('❌ Failed to schedule reminder:', err);
        }
    };

    return (
        <View style={styles.container}>
            <Title style={styles.title}>Quiz Settings</Title>

            {!isProUser ? (
                <View style={styles.titleLine}>
                    <Icon name="lock" style={styles.icon} fill="#673AB7" />
                    <Text style={styles.labelLocked}>Number of Questions: {quizLength}</Text>
                </View>
            ) : (
                <Text style={styles.label}>Number of Questions: {quizLength}</Text>
            )}
            <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={5}
                maximumValue={15}
                step={5}
                value={quizLength}
                disabled={!isProUser}
                onSlidingComplete={setQuizLength}
                minimumTrackTintColor="#6200ee"
                maximumTrackTintColor="#ddd"
            />

            {isProUser || isAdvancedUser ? (
                <View style={styles.titleLine}>
                    <Text style={styles.label}>Difficulty:</Text>
                </View>
            ) : (
                <View style={styles.titleLine}>
                <Icon name="lock" style={styles.icon} fill="#673AB7" />
                <Text style={styles.labelLocked}>Difficulty:</Text>
                </View>
            )}
            <SegmentedButtons
                value={difficulty}
                onValueChange={setDifficulty}
                buttons={[
                    { value: 'easy', label: 'Easy' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'hard', label: 'Hard' },
                ]}
                style={{
                    opacity: isAdvancedUser || isProUser  ? 1 : 0.4,
                    pointerEvents: isAdvancedUser || isProUser ? 'auto' : 'none',
                }}
            />

            <View style={styles.settingRow}>
                <Text style={styles.label}>Enable Reminder</Text>
                <Switch value={reminderEnabled} onValueChange={setReminderEnabled} />
            </View>

            {reminderEnabled && (
                <View style={styles.settingRow}>
                    <Text style={styles.label}>
                        Reminder Time: {reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Button onPress={() => setShowTimePicker(true)}>Change Time</Button>
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
            {!showTimePicker && (
                <View style={styles.proCard}>
                <Title style={styles.title}>🚀 Be Pro</Title>
                <Text style={{ marginBottom: 10 }}>
                    Unlock faster quizzes, remove ads, and boost your learning experience.
                </Text>
                {!isAdvancedUser && !isProUser && (
                    <Button
                        mode="contained"
                        icon="rocket"
                        style={styles.proButton}
                        onPress={() => navigation.navigate('AdvancedOffering')}
                    >
                        Upgrade to Advanced Member
                    </Button>
                )}
                {!isProUser && (
                    <Button
                        mode="contained"
                        icon="star"
                        style={styles.proButton}
                        onPress={() => navigation.navigate('PremiumOffering')}
                    >
                        Upgrade to Premium
                    </Button>
                )}
                {(isProUser || isAdvancedUser) && (
                    <Button
                        mode="contained"
                        icon="lock"
                        style={styles.proButtonAfter}
                        onPress={() => Alert.alert('You are already subscribed!', 'Thank you for your support!')}
                    >
                        You are a {isProUser ? 'Pro' : 'Advanced'} user!
                    </Button>
                )}
                <Pressable onPress={() => Linking.openURL('https://sameerthapa.dev')}>
                    <Text style={styles.cancelLink}>Cancel</Text>
                </Pressable>
                    <View style={styles.linkRow}>
                        <Pressable onPress={() => Linking.openURL('https://sameerthapax.github.io/ThinkB-Privacy-Policy/')}>
                            <Text style={styles.legalLink}>Privacy Policy</Text>
                        </Pressable>
                        <Text style={styles.separator}>•</Text>
                        <Pressable onPress={() => Linking.openURL('https://sameerthapax.github.io/ThinkB-Terms-of-Service/')}>
                            <Text style={styles.legalLink}>Terms of Service</Text>
                        </Pressable>
                    </View>
            </View>
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
        marginBottom: 5,
    },
    labelLocked: {
        fontSize: 16,
        color: '#8d8d8d',

    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 15,
    },
    proButton: {
        marginTop: 10,
        backgroundColor: '#673AB7',
    },proButtonAfter: {
        marginTop: 10,
        backgroundColor: 'black',
    },
    titleLine: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },

    icon: {
        width: 18,
        height: 18,
    },
    proCard: {
        marginTop: 20,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    cancelLink: {
        color: '#7c3aed',
        textAlign: 'center',
        textDecorationLine: 'underline',
        marginTop: 10,
        fontSize: 16,
    },
    linkRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    legalLink: {
        color: '#7c3aed',
        fontSize: 14,
        textDecorationLine: 'underline',
        marginHorizontal: 4,
    },
    separator: {
        fontSize: 14,
        color: '#7c3aed',
    },
});