import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from '@ui-kitten/components';

export const onboardingSlides = [
    {
        key: '1',
        component: () => (
            <View style={styles.slide}>

            </View>
        ),
    },
    {
        key: '2',
        component: () => (
            <View style={styles.slide}>
                <Image source={require('../assets/favicon.png')} style={styles.image} />
                <Text category="h4" style={styles.title}>Track Your Streaks 🔥</Text>
                <Text style={styles.text}>Stay consistent and unlock rewards.</Text>
            </View>
        ),
    },
    {
        key: '3',
        component: () => (
            <View style={styles.slide}>
                <Image source={require('../assets/splash-icon.png')} style={styles.image} />
                <Text category="h4" style={styles.title}>View Your Progress 📈</Text>
                <Text style={styles.text}>Review past quizzes and improve weak spots.</Text>
            </View>
        ),
    },
];

const styles = StyleSheet.create({
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    image: {
        width: 200,
        height: 200,
        marginBottom: 30,
        resizeMode: 'contain',
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
