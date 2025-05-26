import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import {SafeAreaView} from "react-native-safe-area-context";

export default function UploadHistoryScreen() {
    const [materials, setMaterials] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        const loadMaterials = async () => {
            const stored = await AsyncStorage.getItem('study-materials');
            const list = stored ? JSON.parse(stored) : [];
            setMaterials(list.reverse());
        };
        loadMaterials();
    }, []);

    const handlePress = (item) => {
        navigation.navigate('ExtractedText', {
            fileName: item.fileName,
            extractedText: item.text,
        });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => handlePress(item)} activeOpacity={0.8}>
            <View style={styles.glassCard}>
                <Text category="h6" style={styles.title}>{item.fileName}</Text>
                <Text appearance="hint" style={styles.date}>{new Date(item.uploadDate).toLocaleString()}</Text>
                <Text category="p2" style={styles.excerpt}>{item.text.slice(0, 200)}...</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', paddingBottom:0 } } edges={['bottom']}>
        <Layout style={styles.container}>
            <FlatList
                data={materials}
                keyExtractor={(_, index) => index.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />
        </Layout>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    list: {
        paddingBottom: 24,
    },
    glassCard: {
        backgroundColor: 'rgba(241,239,239,0.75)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        shadowColor: '#282323',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
        effect: 'blur(10px)',
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        marginBottom: 8,
    },
    excerpt: {
        fontSize: 14,
        color: '#444',
    },
});
