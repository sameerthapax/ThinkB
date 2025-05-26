import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function StudyMaterialsScreen() {
    const [materials, setMaterials] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        const loadMaterials = async () => {
            const stored = await AsyncStorage.getItem('study-materials');
            const parsed = stored ? JSON.parse(stored) : [];
            setMaterials(parsed.reverse()); // Newest first
        };
        loadMaterials();
    }, []);

    const renderItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Title title={item.fileName} subtitle={`Uploaded: ${item.uploadDate.split('T')[0]}`} />
            <Card.Content>
                <Text numberOfLines={2} style={styles.preview}>{item.text.slice(0, 200)}...</Text>
            </Card.Content>
            <Card.Actions>
                <Button onPress={() => navigation.navigate('Quiz', { mode: 'review', quiz: item.quiz })}>Review Quiz</Button>
                <Button onPress={async () => {
                    const todayKey = `quiz-${new Date().toISOString().split('T')[0]}`;
                    await AsyncStorage.setItem(todayKey, JSON.stringify(item.quiz));
                    navigation.navigate('Quiz');
                }}>Retry</Button>
            </Card.Actions>
        </Card>
    );

    return (
        <FlatList
            contentContainerStyle={styles.container}
            data={materials}
            keyExtractor={(_, i) => i.toString()}
            renderItem={renderItem}
            ListEmptyComponent={<Text style={styles.status}>No study materials uploaded yet.</Text>}
        />
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    card: { marginBottom: 16 },
    preview: { fontSize: 14, color: '#555', marginTop: 8 },
    status: { textAlign: 'center', marginTop: 40, fontSize: 16, color: 'gray' },
});
