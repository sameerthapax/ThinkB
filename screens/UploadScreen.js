import React, { useState, useRef, useContext } from 'react';
import { StyleSheet, ActivityIndicator, View, Alert } from 'react-native';
import { Layout, Text, Button } from '@ui-kitten/components';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
import { showInterstitialAd } from '../utils/showAds';
import * as FileSystem from 'expo-file-system';
import { WebView } from 'react-native-webview';
import LottieView from 'lottie-react-native';
import { SubscriptionContext } from '../context/SubscriptionContext';


export default function UploadScreen() {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [pdfBase64, setPdfBase64] = useState(null);
    const navigation = useNavigation();
    const webviewRef = useRef(null);
    const { isProUser = false, isAdvancedUser = false, refresh } = useContext(SubscriptionContext); // fallback added

    const handleShowAd = async () => {
        await showInterstitialAd();
    };
    const handleUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: false,
            });

            if (result.canceled || !result.assets?.length) {
                Alert.alert('Cancelled', 'You cancelled the file selection.');
                return;
            }

            setLoading(true);
            await refresh?.(); // optional chaining in case refresh is undefined

            if (!isProUser && !isAdvancedUser) {
                await handleShowAd?.();

            }

            const file = result.assets[0];
            const fileUri = file?.uri;

            if (!fileUri) throw new Error('Invalid file URI.');

            const base64 = await FileSystem.readAsStringAsync(fileUri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            setPdfBase64(base64);
        } catch (error) {
            __DEV__ && console.error('❌ Error uploading PDF:', error);
            setLoading(false);
            Alert.alert('Error', 'Something went wrong during upload.');
        }
    };

    const handleMessage = (event) => {
        const extractedText = event?.nativeEvent?.data?.trim();

        if (!extractedText) {
            setPdfBase64(null);
            setLoading(false);
            Alert.alert('Extraction Failed', 'Could not extract text from PDF. Please try another file.');
            return;
        }

        setDone(true);
        setTimeout(() => {
            setLoading(false);
            setDone(false);
            setPdfBase64(null);
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
                    onError={(e) => {
                        __DEV__ && console.error('❌ WebView error:', e?.nativeEvent);
                        setLoading(false);
                        setPdfBase64(null);
                        Alert.alert('Error', 'WebView failed to load. Try again.');
                    }}
                    onLoad={() => {
                        const js = `window.loadPdfFromBase64("${pdfBase64}"); true;`;
                        if (webviewRef.current) {
                            webviewRef.current.injectJavaScript(js);
                        }
                    }}
                    style={{ height: 0, width: 0 }}
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