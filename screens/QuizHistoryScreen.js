import React, {useCallback, useEffect, useState} from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {SafeAreaView} from "react-native-safe-area-context";


export default function HistoryScreen() {
    const [history, setHistory] = useState([]);
    const navigation = useNavigation();
    useFocusEffect(
    useCallback(() => {
        const loadHistory = async () => {
            const stored = await AsyncStorage.getItem('quiz-history');
            const parsed = stored ? JSON.parse(stored) : [];
            setHistory(parsed.reverse()); // newest first
        };
        loadHistory();
    }, []))

    const handleReview = (quiz) => {
        navigation.navigate('ThinkB',{screen: 'Quiz', params: { mode: 'review', reset: true, Quiz: quiz }});
    };

    const handleRetry = async (quiz) => {
        const todayKey = `quiz-${new Date().toISOString().split('T')[0]}`;
        await AsyncStorage.setItem(todayKey, JSON.stringify(quiz));
        navigation.navigate('ThinkB',{screen: 'Quiz',  params: { reset: true, Quiz: quiz }});
    };
    const renderRightActions = (navigation) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('MyQuizzes')}
            style={{ marginRight: 16 }}
        >
            <Text style={{ color: '#007aff', fontSize: 16 }}>My Quizzes</Text>
        </TouchableOpacity>
    );
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => renderRightActions(navigation),
        });
    }, [navigation]);

    if (!history.length) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No quiz history yet.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0)' } } edges={['']}>
            <FlatList
            contentContainerStyle={styles.container}
            data={history}
            keyExtractor={(item, index) => item.date + index}
            renderItem={({ item }) => (
                <Card style={styles.card} elevation={4}>
                    <Card.Title
                        title={
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <MaterialCommunityIcons name="calendar" size={20} style={{ marginRight: 6 }} />
                                <Text style={styles.cardTitle}>{item.date}</Text>
                            </View>
                        }
                        subtitle={
                        `Score: ${item.score}/${item.total} | Time: ${item.time}`
                    }
                        titleStyle={styles.cardTitle}
                        subtitleStyle={styles.cardSubtitle}
                    />
                    <Card.Actions style={styles.actions}>
                        <Button onPress={() => handleReview(item.quiz)} mode="outlined">Review</Button>
                        <Button onPress={() => handleRetry(item.quiz)} mode="contained" style={styles.retryBtn}>Retry</Button>
                    </Card.Actions>
                </Card>

            )}
            />
        </SafeAreaView>
    );
}

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
    actions: {
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingBottom: 12,
    },
    retryBtn: {
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyText: {
        fontSize: 18,
        color: 'gray',
        textAlign: 'center',
    },
});
