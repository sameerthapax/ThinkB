import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Button, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateQuizFromText } from '../utils/generateQuiz';
import { parseQuizJson } from '../utils/parseQuiz';
import { showInterstitialAd } from '../utils/showAds';
import { useNavigation, useRoute } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

import { SubscriptionContext } from '../context/SubscriptionContext';


export default function ExtractedTextScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { extractedText = '', fileName = 'Untitled' } = route.params || {};
    if (!extractedText) {
        alert('Missing extracted text. Please try again.');
        navigation.goBack();
        return null;
    }

    const handleShowAd = async () => {
        await showInterstitialAd();
    };
    const [loading, setLoading] = useState(false);
    const [showCheckmark, setShowCheckmark] = useState(false);
    const abortControllerRef = useRef(new AbortController());
    const { isProUser, isAdvancedUser, refresh} = useContext(SubscriptionContext);


    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', () => {
            if (loading) {
                __DEV__ && console.log('🛑 Navigation event detected, aborting...');
                abortControllerRef.current.abort();
            }
        });

        return unsubscribe;
    }, [navigation, loading]);

    const handleGenerateQuiz = async () => {
        abortControllerRef.current = new AbortController();

        try {
            setLoading(true);
            let parsedSettings = { quizLength: 5, difficulty: 'easy' };
            try {
                const settings = await AsyncStorage.getItem('quiz-settings');
                if (settings) parsedSettings = JSON.parse(settings);
            } catch (err) {
                __DEV__ && console.warn('⚠️ Error parsing settings:', err);
            }
            await refresh();
            // Determine user status
            let userStatus = 'normal';
            if (isProUser) {
                userStatus = 'pro';
            } else if (isAdvancedUser) {
                userStatus = 'advanced';
            }else {
                await handleShowAd?.(); // Show ad before processing if not a pro user
            }

            const rawQuizText = await generateQuizFromText(
                extractedText,
                {
                    numberOfQuestions: parsedSettings.quizLength,
                    difficulty: parsedSettings.difficulty,
                    generationMode: 'Manual'

                },
                abortControllerRef.current.signal,
                userStatus
            );
            if(rawQuizText==='Failed') {
                setLoading(false);
                alert('Failed to generate quiz. Quiz limit reached for today. Try again after 24Hrs.');
                return;
            }

            if (!rawQuizText || rawQuizText.trim().length === 0) {
                setLoading(false);
                alert('AI could not generate a quiz. Try a different document.');
                return;
            }

            let parsedQuiz = null;
            try {
                parsedQuiz = parseQuizJson(rawQuizText);
            } catch (e) {
                alert('Failed to parse quiz. Please try again.');
                __DEV__ && console.error('❌ parseQuizJson error:', e);
                setLoading(false);
                return;
            }
            const todayKey = `quiz-${new Date().toISOString().split('T')[0]}`;
            await AsyncStorage.setItem(todayKey, JSON.stringify(parsedQuiz));

            const materialEntry = {
                fileName,
                uploadDate: new Date().toISOString(),
                text: extractedText,
                quiz: parsedQuiz,
            };

            let materialList = [];
            try {
                const existing = await AsyncStorage.getItem('study-materials');
                if (existing) materialList = JSON.parse(existing);
            } catch (err) {
                __DEV__ && console.warn('⚠️ Failed to parse study materials:', err);
            }
            materialList.push(materialEntry);
            await AsyncStorage.setItem('study-materials', JSON.stringify(materialList));

            setShowCheckmark(true);
            setTimeout(() => {
                if (navigation && navigation.navigate) {
                    navigation.navigate('ThinkB', {
                        screen: 'Quiz',
                        params: { Quiz: parsedQuiz },
                    });
                }
            }, 1500);
        } catch (error) {
            if (error.name === 'AbortError') {
                __DEV__ && console.log('🛑 Quiz generation aborted by user');
            } else {
                __DEV__ && console.error('❌ Quiz generation failed:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollContainer}>
                <Text style={styles.body}>{extractedText}</Text>
            </ScrollView>

            <View style={styles.footer}>
                {loading ? (
                    <View>
                        <ActivityIndicator size="large" color="#3366FF" />
                        <Text style={styles.subHeading1}>Talking with AI and making your quiz ready...</Text>
                        <Text style={styles.subHeading2}>This can take up to 3 mins.</Text>
                    </View>
                ) : showCheckmark ? (
                    <View>
                        <LottieView
                            source={require('../assets/checkmark.json')}
                            autoPlay
                            loop={false}
                            style={{ width: 100, height: 100, alignSelf: 'center' }}
                        />
                    </View>
                ) : (
                    <>
                        <Button mode="contained" onPress={handleGenerateQuiz} style={styles.button}>
                            Generate Quiz
                        </Button>
                        <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
                            Cancel
                        </Button>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        backgroundColor: '#fff',
    },
    subHeading1: {
        fontSize: 10,
        marginBottom: 12,
        fontWeight: '400',
        textAlign: 'center',
    },
    subHeading2: {
        fontSize: 8,
        fontWeight: '200',
        marginBottom: 12,
        textAlign: 'center',
    },
    scrollContainer: {
        flex: 1,
        marginBottom: 100,
    },
    body: {
        fontSize: 14,
        color: '#333',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    button: {
        marginVertical: 6,
    },
});