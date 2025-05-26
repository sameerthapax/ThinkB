import React, { useState } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { Layout, Text, Button } from '@ui-kitten/components';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { generateQuizFromText } from '../utils/generateQuiz';
import { parseQuizText } from '../utils/parseQuiz';

const uploadToBackend = async (fileUri) => {
    const formData = new FormData();
    formData.append('file', {
        uri: fileUri,
        name: 'study.pdf',
        type: 'application/pdf',
    });

    const response = await fetch('https://pdftextextractor-wl9d.onrender.com/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
    });

    const json = await response.json();
    if (!json.text) throw new Error('No text received from backend');
    return json.text;
};

export default function UploadScreen() {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const navigation = useNavigation();

    const handleUpload = async () => {
        try {
            setLoading(true);
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: false,
            });

            if (result.canceled) {
                setLoading(false);
                return;
            }

            const file = result.assets[0];
            const extracted = await uploadToBackend(file.uri);

            setDone(true);
            setTimeout(() => {
                setLoading(false);
                setDone(false);
                navigation.navigate('ExtractedText', {
                    extractedText: extracted,
                    fileName: file.name,
                });
            }, 1500);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const goToHistory = () => {
        navigation.navigate('Materials');
    };

    return (
        <Layout style={styles.container}>
            <Text category='h5' style={styles.heading}>Upload a PDF</Text>
            <Button style={styles.button} onPress={handleUpload}>
                Choose PDF File
            </Button>
            <Button style={styles.button} appearance="outline" onPress={goToHistory}>
                View Upload History
            </Button>

            {loading && !done && <ActivityIndicator size="large" color="#3366FF" />}
            {done && (
                <LottieView
                    source={require('../assets/checkmark.json')}
                    autoPlay
                    loop={false}
                    style={styles.lottie}
                />
            )}
        </Layout>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    heading: {
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        marginVertical: 10,
        width: '80%',
    },
    lottie: {
        width: 120,
        height: 120,
        marginTop: 20,
    },
});
