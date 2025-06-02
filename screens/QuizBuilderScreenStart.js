import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Layout, Text, Input, Button } from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QuizBuilderScreenStart() {
    const navigation = useNavigation();
    const [questionCount, setQuestionCount] = useState('');
    const [quizTitle, setQuizTitle] = useState('');
    const [error, setError] = useState('');

    const handleStart = () => {
        const count = parseInt(questionCount, 10);
        if (isNaN(count) || count <= 0 || count > 50) {
            setError('Please enter a number between 1 and 50');
            return;
        }
        setError('');
        navigation.navigate('QuizBuilderCreate', { totalQuestions: count, QuizTitle: quizTitle });
    };

    return (
        <SafeAreaView style={{ flex: 1 , backgroundColor:'#fff' }}>
        <Layout style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.inner}
            >
                <Text category='h4' style={styles.title}>
                    Build Your Own Quiz
                </Text>
                <Input
                    label="Quiz Title"
                    placeholder="Enter a Title"
                    keyboardType="default"
                    value={quizTitle}
                    onChangeText={setQuizTitle}
                    style={styles.input}
                    status={error ? 'danger' : 'basic'}
                    caption={error}
                />

                <Input
                    label="How many questions do you want to create?"
                    placeholder="Enter a number"
                    keyboardType="numeric"
                    value={questionCount}
                    onChangeText={setQuestionCount}
                    style={styles.input}
                    status={error ? 'danger' : 'basic'}
                    caption={error}
                />

                <Button onPress={handleStart} style={styles.button}>
                    Start Building
                </Button>
            </KeyboardAvoidingView>
        </Layout>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    inner: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        marginBottom: 32,
        textAlign: 'center',
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 16,
    },
});
