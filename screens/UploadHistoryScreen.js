// UploadHistoryScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, Title } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UploadHistoryScreen() {
    const [materials, setMaterials] = useState([]);

    useEffect(() => {
        const loadMaterials = async () => {
            const stored = await AsyncStorage.getItem('study-materials');
            const list = stored ? JSON.parse(stored) : [];
            setMaterials(list.reverse()); // show newest first
        };
        loadMaterials();
    }, []);

    const renderItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content>
                <Title>{item.fileName}</Title>
                <Text>{new Date(item.uploadDate).toLocaleString()}</Text>
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Uploaded Materials</Text>
            <FlatList
                data={materials}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    list: {
        paddingBottom: 20,
    },
    card: {
        marginBottom: 12,
    },
});
