import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyQuizScreen(){
    const [quizzes, setQuizzes] = useState([]);
    const navigation = useNavigation();

    useFocusEffect(
        React.useCallback(() => {
            const fetchCustomQuizzes = async () => {
                const allKeys = await AsyncStorage.getAllKeys();
                const customQuizKeys = allKeys.filter((key) => key.startsWith('quizC-'));

                const keyValuePairs = await AsyncStorage.multiGet(customQuizKeys);
                const parsedQuizzes = keyValuePairs.map(([key, value]) => {
                    try {
                        const quiz = JSON.parse(value);
                        return {
                            id: quiz.id,
                            title: quiz.title,
                            numberOfQuestions: quiz.numberOfQuestions,
                            date: quiz.date,
                            questions: quiz.questions,
                        };
                    } catch {
                        return null;
                    }
                }).filter(Boolean);

                setQuizzes(parsedQuizzes);
            };

            fetchCustomQuizzes();
        }, [])
    );
    const handleReview = (quiz) => {
        navigation.navigate('ThinkB',{screen: 'Quiz', params: { mode: 'review', reset: true, Quiz: quiz }});
    };

    const handleRetry = async (quiz) => {
        const todayKey = `quiz-${new Date().toISOString().split('T')[0]}`;
        await AsyncStorage.setItem(todayKey, JSON.stringify(quiz));
        navigation.navigate('ThinkB',{screen: 'Quiz',  params: { reset: true, Quiz: quiz }});
    };


    return (

    <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0)' } } edges={['']}>
        {quizzes.length === 0 ? (
            <Text appearance="hint" style={styles.emptyText}>You haven’t created any quizzes yet.</Text>
        ) : (
        <FlatList
            contentContainerStyle={styles.container}
            data={quizzes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <Card style={styles.card} elevation={4}>
                    <Card.Title
                        title={
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <MaterialCommunityIcons name="flash" size={20} style={{ marginRight: 6 }} />
                                <Text style={styles.cardTitle}>{item.title}</Text>
                            </View>
                        }
                        subtitle={
                            `Created: ${new Date(item.date).toLocaleDateString()}`
                        }
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
