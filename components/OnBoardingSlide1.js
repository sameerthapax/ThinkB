import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { Text } from '@ui-kitten/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

export default function OnBoardingSlide1() {
    const animationRef = useRef(null);

    useFocusEffect(
        React.useCallback(() => {
            const timeout = setTimeout(() => {
                try {
                    animationRef.current?.play();
                } catch (e) {
                    __DEV__ && console.warn('⚠️ Animation play failed (timeout):', e);
                }
            }, 700);

            const interval = setInterval(() => {
                try {
                    animationRef.current?.play();
                } catch (e) {
                    __DEV__ && console.warn('⚠️ Animation play failed (interval):', e);
                }
            }, 10 * 1000);

            return () => {
                clearTimeout(timeout);
                clearInterval(interval);
            };
        }, [])
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'bottom']}>
            <View style={styles.slide}>
                <LottieView
                    ref={animationRef}
                    source={require('../assets/logoAnimation.json')}
                    loop={false}
                    autoPlay={false}
                    style={{ width: 200, height: 200, marginTop: '20%', alignSelf: 'center' }}
                    onError={(error) => __DEV__ && console.error('❌ Lottie load failed:', error)}
                />
                <Text category="h4" style={styles.title}>
                    Welcome to <Text category="h4" style={styles.titleT}>Think</Text>
                    <Text category="h4" style={styles.titleB}>B</Text>!
                </Text>
                <Text style={styles.text}>Your personal AI quiz companion.</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    title: {
        marginBottom: 10,
        textAlign: 'center',
    },
    titleT: {
        marginBottom: 10,
        textAlign: 'center',
        color: '#8538e3',
    },
    titleB: {
        marginBottom: 10,
        textAlign: 'center',
        fontWeight: '800',
    },
    text: {
        textAlign: 'center',
        paddingHorizontal: 10,
    },
});