import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyQuizScreen() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useFocusEffect(
        React.useCallback(() => {
            const fetchCustomQuizzes = async () => {
                setLoading(true);
                try {
                    const allKeys = await AsyncStorage.getAllKeys();
                    const customQuizKeys = allKeys.filter((key) => key.startsWith('quizC-'));

                    const keyValuePairs = await AsyncStorage.multiGet(customQuizKeys);
                    const parsedQuizzes = keyValuePairs.map(([key, value]) => {
                        try {
                            const quiz = JSON.parse(value);
                            return {
                                id: quiz.id || key,
                                title: quiz.title || 'Untitled Quiz',
                                numberOfQuestions: quiz.numberOfQuestions || quiz.questions?.length || 0,
                                date: quiz.date || new Date().toISOString(),
                                questions: quiz.questions || [],
                            };
                        } catch (err) {
                            __DEV__ && console.warn('⚠️ Failed to parse quiz:', err);
                            return null;
                        }
                    }).filter(Boolean);

                    setQuizzes(parsedQuizzes);
                } catch (err) {
                    __DEV__ && console.error('❌ Failed to load quizzes:', err);
                    alert('Something went wrong while loading your quizzes.');
                } finally {
                    setLoading(false);
                }
            };

            fetchCustomQuizzes();
        }, [])
    );

    const handleReview = (quiz) => {
        if (!quiz || quiz.length === 0) {
            alert('This quiz appears to be empty.');
            return;
        }
        navigation.navigate('ThinkB', {
            screen: 'Quiz',
            params: { mode: 'review', reset: true, Quiz: quiz }
        });
    };

    const handleRetry = async (quiz) => {
        try {
            if (!quiz || quiz.length === 0) {
                alert('Quiz is empty and cannot be retried.');
                return;
            }
            const todayKey = `quiz-${new Date().toISOString().split('T')[0]}`;
            await AsyncStorage.setItem(todayKey, JSON.stringify(quiz));
            navigation.navigate('ThinkB', {
                screen: 'Quiz',
                params: { reset: true, Quiz: quiz }
            });
        } catch (err) {
            __DEV__ && console.error('❌ Failed to retry quiz:', err);
            alert('Could not retry this quiz. Try again later.');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0)' }} edges={['']}>
            {loading ? (
                <ActivityIndicator size="large" style={{ marginTop: 32 }} />
            ) : quizzes.length === 0 ? (
                <Text appearance="hint" style={styles.emptyText}>You haven’t created any quizzes yet.</Text>
            ) : (
                <FlatList
                    contentContainerStyle={styles.container}
                    data={quizzes}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    renderItem={({ item }) => (
                        <Card style={styles.card} elevation={4}>
                            <Card.Title
                                title={
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <MaterialCommunityIcons name="flash" size={20} style={{ marginRight: 6 }} />
                                        <Text style={styles.cardTitle}>{item.title}</Text>
                                    </View>
                                }
                                subtitle={`Created: ${new Date(item.date).toLocaleDateString()}`}
                                titleStyle={styles.cardTitle}
                                subtitleStyle={styles.cardSubtitle}
                            />
                            <Card.Actions style={styles.actions}>
                                <Button onPress={() => handleReview(item.questions)} mode="outlined">Review</Button>
                                <Button onPress={() => handleRetry(item.questions)} mode="contained" style={styles.retryBtn}>Retry</Button>
                            </Card.Actions>
                        </Card>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 80,
        backgroundColor: 'rgba(255,255,255,0)',
    },
    card: {
        marginBottom: 16,
        borderRadius: 12,
    },
    cardTitle: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    cardSubtitle: {
        color: 'gray',
    },
    title: {
        marginBottom: 16,
        fontWeight: '600',
    },
    emptyText: {
        marginTop: 24,
        textAlign: 'center',
    },
    list: {
        paddingBottom: 100,
    },
});