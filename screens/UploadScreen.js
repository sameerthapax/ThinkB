import React, { useState, useRef } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { Layout, Text, Button } from '@ui-kitten/components';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
import { useInterstitialAd } from '../utils/showAds';
import * as FileSystem from 'expo-file-system';
import { WebView } from 'react-native-webview';
import LottieView from 'lottie-react-native';

export default function UploadScreen() {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [pdfBase64, setPdfBase64] = useState(null);
    const navigation = useNavigation();
    const webviewRef = useRef(null);
    const { showAd } = useInterstitialAd();

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
            const fileUri = file.uri;

            const base64 = await FileSystem.readAsStringAsync(fileUri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            await showAd();
            setPdfBase64(base64);
        } catch (error) {
            console.error('❌ Error uploading PDF:', error);
            setLoading(false);
        }
    };

    const handleMessage = (event) => {
        const extractedText = event.nativeEvent.data;
        if (!extractedText) {
            setLoading(false);
            return;
        }

        setDone(true);
        setTimeout(() => {
            setLoading(false);
            setDone(false);
            navigation.navigate('ExtractedText', {
                extractedText,
                fileName: 'Extracted PDF',
            });
        }, 1500);
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


            {loading && !done && (
                <View>
                <ActivityIndicator size="large" color="#3366FF" />
                    <Text category='s1' style={styles.heading}>Parsing your data... This might take some time.</Text>
                </View>
            )}

            {done && (
                <View style={styles.animationContainer}>
                    <LottieView
                        source={require('../assets/checkmark.json')}
                        autoPlay
                        loop={false}
                        style={styles.lottie}
                    />
                </View>
            )}

            {pdfBase64 && (
                <WebView
                    ref={webviewRef}
                    source={require('../assets/pdfviewer.html')}
                    originWhitelist={['*']}
                    onMessage={handleMessage}
                    onLoad={() => {
                        const js = `window.loadPdfFromBase64("${pdfBase64}"); true;`;
                        webviewRef.current.injectJavaScript(js);
                    }}
                    style={{ height: 0, width: 0 }} // hide WebView
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
    animationContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
});
