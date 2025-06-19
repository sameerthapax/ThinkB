import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Layout, Text, Input, Button, Radio, RadioGroup } from '@ui-kitten/components';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QuizBuilderScreenCreate({ route, navigation }) {
    const totalQuestions = route.params?.totalQuestions || 1;
    const QuizTitle = route.params?.QuizTitle || 'Untitled Quiz';

    const [currentIndex, setCurrentIndex] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [questionText, setQuestionText] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctIndex, setCorrectIndex] = useState(null);

    const handleNext = () => {
        if (!questionText.trim() || options.some(opt => !opt.trim()) || correctIndex === null) {
            Alert.alert('⚠️ Incomplete', 'Please fill out the question, all options, and select a correct answer.');
            return;
        }

        const currentQuestion = {
            question: questionText.trim(),
            choices: options.map(opt => opt.trim()),
            correctAnswerIndex: correctIndex,
        };

        const updatedQuestions = [...questions, currentQuestion];

        try {
            if (currentIndex + 1 >= totalQuestions) {
                navigation.navigate('QuizBuilderPreview', {
                    questions: updatedQuestions,
                    quizTitle: QuizTitle,
                });
            } else {
                setQuestions(updatedQuestions);
                setCurrentIndex(currentIndex + 1);
                setQuestionText('');
                setOptions(['', '', '', '']);
                setCorrectIndex(null);
            }
        } catch (e) {
            console.error('❌ Navigation failed:', e);
            Alert.alert('Navigation error', 'Something went wrong. Please restart.');
        }
    };

    const handleOptionChange = (text, index) => {
        const updatedOptions = [...options];
        updatedOptions[index] = text;
        setOptions(updatedOptions);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom']}>
            <Layout style={styles.container}>
                <ScrollView contentContainerStyle={styles.content}>
                    <Text category="h5" style={{ marginBottom: 16, textAlign: 'center' }}>
                        {QuizTitle}
                    </Text>
                    <Text category="h6">
                        Question {currentIndex + 1} of {totalQuestions}
                    </Text>

                    <Input
                        label="Question"
                        placeholder="Enter your question"
                        value={questionText}
                        onChangeText={setQuestionText}
                        style={styles.input}
                        multiline
                        textStyle={{ minHeight: 64 }}
                    />

                    {options.map((opt, index) => (
                        <Input
                            key={index}
                            label={`Option ${String.fromCharCode(65 + index)}`}
                            placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                            value={opt}
                            onChangeText={text => handleOptionChange(text, index)}
                            style={styles.input}
                        />
                    ))}

                    <Text category="label" style={{ marginTop: 8, marginBottom: 4 }}>
                        Select the correct answer:
                    </Text>
                    <RadioGroup
                        selectedIndex={correctIndex}
                        onChange={index => setCorrectIndex(index)}
                        style={{ marginBottom: 16 }}
                    >
                        {options.map((_, index) => (
                            <Radio key={index}>Option {String.fromCharCode(65 + index)}</Radio>
                        ))}
                    </RadioGroup>

                    <Button onPress={handleNext}>
                        {currentIndex + 1 === totalQuestions ? 'Finish' : 'Next'}
                    </Button>
                </ScrollView>
            </Layout>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    content: {
        paddingBottom: 24,
    },
    input: {
        marginBottom: 16,
    },
});