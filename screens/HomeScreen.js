import React, {useState, useCallback, useEffect, useRef} from 'react';
import {View, StyleSheet, ScrollView, StatusBar, Image, Dimensions} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Layout, Text, Button, Icon, TopNavigationAction } from '@ui-kitten/components';
import { CircularProgressBar } from '@ui-kitten/components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import * as Notifications from "expo-notifications";
import { checkStreak } from '../utils/streakManager';

const checkScheduledNotifications = async () => {
    try {
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        console.log('📅 Scheduled notifications:', scheduled);

        if (scheduled.length === 0) {
            console.log('ℹ️ No notifications are currently scheduled.');
        } else {
            scheduled.forEach((notif, index) => {
                console.log(`🔔 Notification ${index + 1}:`, notif.trigger?.date || notif.trigger.dateComponents);
            });
        }
    } catch (err) {
        console.error('❌ Error fetching scheduled notifications:', err);
    }
};
const logAsyncStorage = async () => {
    try {
        const keys = await AsyncStorage.getItem('quiz-settings');
        // const stores = await AsyncStorage.multiGet(keys);
        console.log('📦 AsyncStorage Contents:', keys);
    } catch (e) {
        console.error('❌ Error reading AsyncStorage:', e);
    }
};

const screenHeight = Dimensions.get('window').height;
export default function HomeScreen({ navigation }) {
    const [streak, setStreak] = useState(0);
    const [todayScore, setTodayScore] = useState(0);
    const [totalQuizToday, setTotalQuizToday] = useState(0);
    const [todayDocumentName, setTodayDocumentName] = useState('');
    const [todayTotalDocument, setTodayTotalDocument] = useState(0);
    const badgeRefs = useRef({});
    const streaksRefs = useRef({});






    useFocusEffect(useCallback(() => {
        Object.values(badgeRefs.current).forEach(ref => {
            ref?.play();
        });
        const interval = setInterval(() => {
            Object.values(badgeRefs.current).forEach(ref => {
                ref?.play();
            });
        }, 10 * 1000);

        return () => clearInterval(interval);
    }, []));
    useFocusEffect(useCallback(() => {
        streaksRefs.current?.play();
        const interval = setInterval(() => {
            streaksRefs.current?.play();
        }, 10 * 1000);

        return () => clearInterval(interval);
    }, []));
    const InfoIcon = (props) => <Icon {...props} name="arrow-circle-up" fill={'#7c3aed'} />;
    const renderRightActions = (navigation) => (
        <TopNavigationAction
            icon={InfoIcon}
            onPress={() => navigation.navigate('Materials')}
        />
    );
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => renderRightActions(navigation),
        });
    }, [navigation]);




    useFocusEffect(
        useCallback(() => {
            const loadStreakAndScore = async () => {
                await checkStreak();
                const storedStreak = await AsyncStorage.getItem('quiz-streak');
                const streakData = storedStreak ? JSON.parse(storedStreak) : { streak: 0 };
                setStreak(streakData.streak);

                const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd

                const historyRaw = await AsyncStorage.getItem('quiz-history');
                const fileHistoryRaw = await AsyncStorage.getItem('study-materials');
                const history = historyRaw ? JSON.parse(historyRaw) : [];
                const fileHistory = fileHistoryRaw ? JSON.parse(fileHistoryRaw) : [];

                const todaysQuizzes = history.filter(q => q.date === today);
                const todaysFileHistory = fileHistory.filter(q => q.uploadDate.split('T')[0] === today);

                if (todaysQuizzes.length > 0) {
                    // Optional: sort by time if needed
                    const sorted = todaysQuizzes.sort((a, b) =>
                        new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
                    );

                    setTodayScore(sorted[0].score);

                } else {
                    setTodayScore(0); // No quiz today yet
                }
                setTotalQuizToday(todaysQuizzes.length); //  set total quiz today
                setTodayTotalDocument(todaysFileHistory.length); //  set total quiz today
            };

            loadStreakAndScore();
        }, [])
    );


    return (
        <SafeAreaView style={{flex: 1, backgroundColor:'#fff'}} edges={['bottom', 'left', 'right']}>
        <Layout style={styles.container}>
            <View style={styles.scrollContent}>
            <View style={styles.streakCard}>

                <Text appearance='hint' style={styles.streakLabel}>Streaks</Text>
                <View style={styles.streakRow}>
                    <Text style={styles.streakNumber}>{streak}</Text>
                    <LottieView
                        ref={(ref) => {
                            if (ref) streaksRefs.current = ref;
                        }}
                        source={require('../assets/streaks.json')}
                        autoPlay
                        loop={false} // we manually replay every 2 minutes
                        style={styles.fire}
                    />

                </View>
            </View>

                <View style={styles.achievementCard}>
                    <Text style={styles.cardTitle}>Achievements</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {[1, 3, 7, 20].map((day, idx) => {
                            const isUnlocked = streak >= day;

                            const badgeSources = {
                                1: require('../assets/badge1.json'),
                                3: require('../assets/badge3.json'),
                                7: require('../assets/badge7.json'),
                                20: require('../assets/badge20.json'),
                            };

                            return (
                                <View key={day} style={[styles.achievementBadge, !isUnlocked && styles.lockedBadge]}>
                                    {isUnlocked ? (
                                        <LottieView
                                            ref={(ref) => {
                                                if (ref) badgeRefs.current[day] = ref;
                                            }}
                                            source={badgeSources[day]}
                                            autoPlay
                                            loop={false} // we manually replay every 2 minutes
                                            style={{ width: 80, height: 80 }}
                                        />
                                    ) : (
                                        <View style={styles.placeholderBadge}>
                                            <Text style={styles.lockedText}>{day}</Text>
                                            <Text style={styles.lockedSubText}>Days</Text>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>


                <View style={styles.todaysQuizCard}>
                <Text style={styles.cardTitle}>Today's Quiz</Text>
                <View style={styles.todayScoreInnerCard}>
                    <CircularProgressBar style={styles.todayScore} progress={todayScore / 10} size={"giant"} />
                    <View style={styles.todayScoreTextArea}>
                        <Text style={styles.todayScoreText}>Total Quizzes: {totalQuizToday}</Text>
                        <Text style={styles.todayScoreText}>Score: {todayScore} / 10</Text>
                        <Text style={styles.todayScoreText}>Total Document: {todayTotalDocument}</Text>
                    </View>
                </View>

            </View>

            {/*<View style={styles.grid}>*/}
            {/*    <Button*/}
            {/*        mode="contained"*/}
            {/*        style={styles.menuButton}*/}
            {/*        onPress={checkScheduledNotifications}*/}
            {/*    >*/}
            {/*        {evaProps => <Text {...evaProps} style={styles.menuButtonText}>Test Notification scheduel</Text>}*/}
            {/*    </Button>*/}
                <Button onPress={logAsyncStorage}>Log AsyncStorage</Button>


            {/*</View>*/}
            {/*    <View style={styles.grid}>*/}
            {/*        <Button*/}
            {/*            style={styles.menuButton}*/}
            {/*            onPress={async () => await AsyncStorage.setItem('hasSeenOnboarding', 'false')}>*/}

            {/*        </Button>*/}
            {/*    </View>*/}

            </View>

        </Layout>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
    },
    scrollContent: {
        paddingTop: StatusBar.currentHeight,
        padding: 24,
        flexGrow: 1,
        justifyContent: 'flex-start',
    },
    streakCard: {
        borderRadius: 20,
        backgroundColor: '#FFE599',
        padding: 24,
        marginBottom: 24,
        alignItems: 'center',
        height: screenHeight * 0.3,
        width: '100%',
    },
    animatedLogo: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
    },
    streakRow: {
        flexDirection: 'row',
        alignSelf: 'center',
    },
    fire: {
        width: 140,
        height: 140,
        marginTop: 10,
    },
    streakNumber: {
        fontSize: 150,
        fontWeight: 'bold',
        color: '#000',
    },
    streakLabel: {
        fontSize: 34,
        color: '#000000',
        fontWeight: '200',
        alignSelf: 'center',
    },
    achievementCard: {
        backgroundColor: '#f3f4f6',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        height: screenHeight * 0.165,
        width: '100%',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '400',
        marginBottom: 10,
        alignSelf: 'center',
    },
    achievementBadge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#d1fae5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    achievementText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#065f46',
    },
    lockedBadge: {
        backgroundColor: '#e5e7eb', // Tailwind gray-200
        opacity: 0.5,
    },

    placeholderBadge: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: 80,
    },

    lockedText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#6b7280', // Tailwind gray-500
    },

    lockedSubText: {
        fontSize: 12,
        color: '#6b7280',
    },

    todaysQuizCard: {
        backgroundColor: '#f3f4f6',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,


    },
    todayScoreInnerCard: {
        backgroundColor: 'rgba(224,224,224,0.7)',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        gap: '10%',
        height: screenHeight * 0.15,
        width: '100%',
    },
    todayScore: {
        alignSelf: 'flex-start',
        marginVertical: 'auto',
        color: '#cc0c0c',
    },
    todayScoreTextArea: {
        color: '#000',
        alignSelf: 'center',
        marginVertical: 'auto',
    },
    todayScoreText: {
        fontSize: 20,
        fontWeight: '400',
        color: '#000',
        marginBottom: 8,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    menuButton: {
        width: '48%',
        borderRadius: 12,
        marginBottom: 16,
        height: '50%',
        backgroundColor: '#7c3aed',
    },
    menuButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff', // Indigo shade
        textAlign: 'center',
    },
});
