// ExtractedTextScreen.js
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateQuizFromText } from '../utils/generateQuiz';
import { parseQuizText } from '../utils/parseQuiz';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function ExtractedTextScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { extractedText, fileName } = route.params;

    const handleGenerateQuiz = async () => {
        const settings = await AsyncStorage.getItem('quiz-settings');
        const parsedSettings = settings
            ? JSON.parse(settings)
            : { quizLength: 10, difficulty: 'medium' };

        const rawQuizText = await generateQuizFromText(extractedText, {
            numberOfQuestions: parsedSettings.quizLength,
            difficulty: parsedSettings.difficulty,
        });

        const parsedQuiz = parseQuizText(rawQuizText);
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

        navigation.navigate('Quiz');
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.heading}>Extracted Text</Text>
            <Text style={styles.body}>{extractedText}</Text>
            <View style={styles.actions}>
                <Button mode="contained" onPress={handleGenerateQuiz}>
                    Generate Quiz
                </Button>
                <Button mode="outlined" onPress={() => navigation.goBack()} style={{ marginTop: 10 }}>
                    Cancel
                </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 24,
        backgroundColor: '#fff',
    },
    heading: {
        fontSize: 20,
        marginBottom: 16,
        textAlign: 'center',
    },
    body: {
        fontSize: 14,
        color: '#333',
        marginBottom: 24,
    },
    actions: {
        alignItems: 'center',
    },
});
