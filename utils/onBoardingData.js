import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from '@ui-kitten/components';
import LottieView from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OnBoardingSlide1 from '../components/OnBoardingSlide1';
import OnBoardingSlide2 from '../components/OnBoardingSlide2';
import OnBoardingSlide3 from '../components/OnBoardingSlide3';


export const onboardingSlides = [
    {
        key: '1',
        component: OnBoardingSlide1
    },
    {
        key: '2',
        component: OnBoardingSlide2,
    },
    {
        key: '3',
        component: OnBoardingSlide3,

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
    },titleT: {
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
