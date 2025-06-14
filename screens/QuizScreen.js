import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity  } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Button } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import {SafeAreaView} from "react-native-safe-area-context";
import {updateStreakAfterQuiz} from '../utils/updateStreakAfterQuiz';


export default function QuizScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const isReview = route.params?.mode === 'review';
    const externalQuiz = route.params?.Quiz;

    const [quiz, setQuiz] = useState([]);
    const [index, setIndex] = useState(0);
    const [selected, setSelected] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(isReview ? 1 : 0));
    const resultAnimRef = useRef();

    useFocusEffect(
        useCallback(() => {
            const loadQuiz = async () => {
                if (route.params?.Quiz) {
                    setQuiz(route.params.Quiz);
                } else {
                    const todayKey = `quiz-${new Date().toISOString().split('T')[0]}`;
                    const stored = await AsyncStorage.getItem(todayKey);
                    if (stored) {
                        setQuiz(JSON.parse(stored));
                    }
                }
            };

            if (route.params?.reset) {
                setIndex(0);
                setSelected(null);
                setShowAnswer(false);
                setScore(0);
                setFinished(false);
            }

            loadQuiz();
        }, [route.params])
    );



    useEffect(() => {
        if (finished && !isReview) {
            const saveHistory = async () => {
                const today = new Date().toISOString().split('T')[0];
                const todayTimeLocal = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                const historyItem = {
                    date: today,
                    time: todayTimeLocal,
                    score,
                    total: quiz.length,
                    quiz,
                };
                const existing = await AsyncStorage.getItem('quiz-history');
                const history = existing ? JSON.parse(existing) : [];
                history.push(historyItem);
                await AsyncStorage.setItem('quiz-history', JSON.stringify(history));
            };


            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }).start();

            saveHistory().then(() => {
                updateStreakAfterQuiz().then(() => {
                    console.log('✅ Streak updated after quiz completion');
                })
            });
        }
        if (finished && isReview) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }).start();
        }
    }, [finished]);
    const renderRightActions = (navigation) => {
        if (!isReview) return (
        <TouchableOpacity
            onPress={() => navigation.navigate('QuizBuilderStart')}
            style={{ marginRight: 16 }}
        >
            <Text style={{ color: '#7c3aed', fontSize: 16 }}>Create</Text>
        </TouchableOpacity>
    )};
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => renderRightActions(navigation),
        });
    }, [navigation]);

    const handleFinish = () => {
        navigation.navigate(isReview ? 'History' : 'Home');
    };

    const current = quiz[index];
    const isCorrect = selected === current?.correctAnswerIndex;

    const handleNext = () => {
        if (!isReview && isCorrect) setScore(prev => prev + 1);

        if (index + 1 < quiz.length) {
            setIndex(index + 1);
            setSelected(null);
            setShowAnswer(false);
        } else {
            setFinished(true);
        }
    };

    if (!quiz.length) return <Text style={styles.status}>No Quiz Found! 🥲</Text>;

    if (finished) {
        return (
            <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                <LottieView
                    ref={resultAnimRef}
                    source={require('../assets/checkmark.json')}
                    autoPlay
                    loop={false}
                    style={{ width: 180, height: 180, alignSelf: 'center' }}
                />
                <Text style={styles.finalText}>🎉 Quiz Completed!</Text>
                {!isReview && (
                    <Text style={styles.scoreText}>Score: {score} / {quiz.length}</Text>
                )}
                <Button mode="contained" onPress={handleFinish} style={styles.button}>
                    Back to {isReview ? 'History' : 'Home'}
                </Button>
            </Animated.View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', paddingBottom:'50%' } } edges={['bottom']}>

        <View style={styles.container}>
            <Text category="s1" style={styles.progress}>Question {index + 1} of {quiz.length}</Text>
            <Text category="h6" style={styles.question}>{current?.question}</Text>

            {current?.choices.map((choice, i) => (
                <TouchableOpacity
                    key={i}
                    onPress={() => !isReview && setSelected(i)}
                    style={[
                        styles.choiceButton,
                        selected === i && styles.selectedChoiceButton
                    ]}
                    activeOpacity={0.7}
                >
                    <Text style={styles.choiceText}>{choice}</Text>
                </TouchableOpacity>
            ))}


            {selected !== null && !showAnswer && !isReview && (
                <Button
                    mode="contained"
                    onPress={() => setShowAnswer(true)}
                    style={styles.button}
                >
                    Submit Answer
                </Button>
            )}

            {showAnswer ? (
                <>
                    <LottieView
                        source={isCorrect ? require('../assets/correctAnswer.json') : require('../assets/wrongAnswer.json')}
                        autoPlay
                        loop={false}
                        style={{ width: 80, height: 80, alignSelf: 'center', marginVertical: 0 }}
                    />
                    <Text style={isCorrect ? styles.correctResult : styles.incorrectResult}>
                        {isCorrect ? 'Correct!' : `Incorrect. Correct Answer:\n${current?.explanation}`}
                    </Text>
                    <Button
                        mode="outlined"
                        onPress={handleNext}
                        style={styles.button}
                    >
                        {index + 1 < quiz.length ? 'Next Question' : 'Finish Quiz'}
                    </Button>
                </>
            ) : isReview ? (
                <>
                    <Text style={styles.reviewExplanation}>
                        {`Correct Answer: ${current?.choices[current.correctAnswerIndex]}`}
                    </Text>
                    <Button
                        mode="outlined"
                        onPress={handleNext}
                        style={styles.buttonNext}
                    >
                        {index + 1 < quiz.length ? 'Next Question' : 'Finish Quiz'}
                    </Button>
                </>
            ) : null}
        </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff',},
    progress: { fontSize: 18, color: '#555', marginBottom: 10 },
    question: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    choiceButton: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        backgroundColor: '#fff',
    },

    selectedChoiceButton: {
        backgroundColor: '#a78bfa', // light purple for selected
        borderColor: '#7c3aed',
    },

    choiceText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
    },


    button: { marginTop: 2 },buttonNext: { marginTop: 0},
    correctResult: { fontSize: 20, textAlign: 'center', color: 'green', marginTop: 0 },
    incorrectResult: { fontSize: 15, textAlign: 'center', color: 'red', marginTop: 0 },
    reviewExplanation: { fontSize: 15, textAlign: 'center', color: '#666', marginTop: 5 },
    status: { padding: 24, textAlign: 'center', fontSize: 18 },
    finalText: { fontSize: 26, textAlign: 'center', marginVertical: 20, fontWeight: 'bold' },
    scoreText: { fontSize: 20, textAlign: 'center', color: '#222' },
});
