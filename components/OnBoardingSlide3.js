import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { Text } from '@ui-kitten/components';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnBoardingSlide3({ isActive }) {
    const animationRef = useRef(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        if (isActive) {
            animationRef.current?.reset();
            animationRef.current?.play(200, 40);
        }
        if(!isActive && isMounted) {
            animationRef.current?.reset();
        }
    }, [isActive, isMounted]);

    return (
        <View style={styles.slide}>
            <LottieView
                ref={(ref) => {
                    animationRef.current = ref;
                    if (ref && !isMounted) setIsMounted(true);
                }}
                source={require('../assets/brainStromingAnimation.json')}
                loop={true}
                autoPlay={false}
                style={{ width: 200, height: 200, marginTop: '20%', alignSelf: 'center' }}/>
            <Text category="h4" style={styles.title}>Train Your Brain</Text>
            <Text style={styles.text}>Take daily AI generated quizzes and microlearn your course.</Text>
        </View>
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
    text: {
        textAlign: 'center',
        paddingHorizontal: 10,
    },
});
