// ExtractedTextScreen.js
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Button, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateQuizFromText } from '../utils/generateQuiz';
import { parseQuizJson } from '../utils/parseQuiz';
import { useInterstitialAd } from '../utils/showAds';
import { useNavigation, useRoute } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

export default function ExtractedTextScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { extractedText, fileName } = route.params;
    const { showAd } = useInterstitialAd();
    const [loading, setLoading] = useState(false);
    const [showCheckmark, setShowCheckmark] = useState(false);

    const handleGenerateQuiz = async () => {
        try {
            setLoading(true);
            const settings = await AsyncStorage.getItem('quiz-settings');
            const parsedSettings = settings
                ? JSON.parse(settings)
                : { quizLength: 10, difficulty: 'medium' };

            showAd();

            const rawQuizText = await generateQuizFromText(extractedText, {
                numberOfQuestions: parsedSettings.quizLength,
                difficulty: parsedSettings.difficulty,
            });

            const parsedQuiz = parseQuizJson(rawQuizText);
            const todayKey = `quiz-${new Date().toISOString().split('T')[0]}`;
            await AsyncStorage.setItem(todayKey, JSON.stringify(parsedQuiz));

            const materialEntry = {
                fileName,
                uploadDate: new Date().toISOString(),
                text: extractedText,
                quiz: parsedQuiz,
            };

            const existing = await AsyncStorage.getItem('study-materials');
            const materialList = existing ? JSON.parse(existing) : [];
            materialList.push(materialEntry);
            await AsyncStorage.setItem('study-materials', JSON.stringify(materialList));

            setLoading(false);
            setShowCheckmark(true);

            setTimeout(() => {
                navigation.navigate('ThinkB',{screen: 'Quiz' , params: { Quiz: parsedQuiz } });
            }, 1500);
        } catch (error) {
            console.error(error);
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
                        <Text category='s1' style={styles.subHeading1}>Talking with AI and making your quiz ready...</Text>
                        <Text category='s1' style={styles.subHeading2}>This can take up to 3 mins.</Text>
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
    heading: {
        fontSize: 20,
        marginBottom: 12,
        textAlign: 'center',
    },
    subHeading1: {
        fontSize: 10,
        marginBottom: 12,
        fontWeight:'400',
        textAlign: 'center',
    },
    subHeading2: {
        fontSize: 8,
        fontWeight:'200',
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
