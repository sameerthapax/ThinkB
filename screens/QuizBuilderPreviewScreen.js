import React from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Button, Card, Layout } from '@ui-kitten/components';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function QuizPreviewScreen() {
    const navigation = useNavigation();
    const route = useRoute();

    const questions = Array.isArray(route.params?.questions) ? route.params.questions : [];

    const handleConfirm = async () => {
        try {
            const quizId = `quizC-${Date.now()}`;
            const quizData = {
                id: quizId,
                title: route.params?.quizTitle || 'My Quiz',
                numberOfQuestions: questions.length,
                date: new Date().toISOString(),
                questions,
            };

            await AsyncStorage.setItem(quizId, JSON.stringify(quizData));
            console.log('✅ Quiz saved to AsyncStorage:', quizId);

            navigation.navigate('ThinkB', {
                screen: 'Quiz',
                params: { Quiz: questions, reset: true },
            });
        } catch (err) {
            console.error('❌ Failed to save quiz:', err);
            Alert.alert('Error', 'Failed to save the quiz. Please try again.');
        }
    };

    return (
        <Layout style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text category='h5' style={styles.title}>Preview Your Quiz</Text>

                {questions.length === 0 ? (
                    <Text style={styles.warningText}>No questions available. Please go back and add questions.</Text>
                ) : (
                    questions.map((q, index) => (
                        <Card key={index} style={styles.card}>
                            <Text category='s1'>{index + 1}. {q.question || '[No question text]'}</Text>
                            {Array.isArray(q.choices) ? (
                                q.choices.map((choice, i) => (
                                    <Text
                                        key={i}
                                        style={[
                                            styles.choiceText,
                                            i === q.correctAnswerIndex && styles.correctAnswer
                                        ]}
                                    >
                                        {String.fromCharCode(65 + i)}) {choice}
                                    </Text>
                                ))
                            ) : (
                                <Text style={{ color: 'red' }}>⚠️ Invalid choices format</Text>
                            )}
                        </Card>
                    ))
                )}

                <View style={styles.buttonRow}>
                    <Button style={styles.button} onPress={() => navigation.goBack()} appearance='outline'>
                        Edit
                    </Button>
                    <Button
                        style={styles.button}
                        onPress={handleConfirm}
                        disabled={questions.length === 0}
                    >
                        Save Quiz
                    </Button>
                </View>
            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    scrollContainer: {
        paddingVertical: 20,
    },
    title: {
        marginBottom: 16,
        textAlign: 'center',
    },
    warningText: {
        marginVertical: 30,
        textAlign: 'center',
        color: 'red',
        fontWeight: '500',
    },
    card: {
        marginBottom: 16,
    },
    choiceText: {
        marginVertical: 2,
    },
    correctAnswer: {
        fontWeight: 'bold',
        color: '#22c55e',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
    },
    button: {
        flex: 1,
        marginHorizontal: 5,
    },
});