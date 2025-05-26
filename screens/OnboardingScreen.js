import React, { useRef, useState } from 'react';
import { FlatList, Dimensions, StyleSheet, View } from 'react-native';
import { Layout, Button } from '@ui-kitten/components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onboardingSlides } from '../utils/onBoardingData';
import {SafeAreaView} from "react-native-safe-area-context";


const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);

    const handleNext = () => {
        if (currentIndex < onboardingSlides.length - 1) {
            flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
        } else {
            finishOnboarding();
        }
    };

    const finishOnboarding = async () => {
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        navigation.replace('ThinkB');
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', paddingBottom: 0 }} edges={['bottom']}>
        <Layout style={{ flex: 1 }}>
            <FlatList
                ref={flatListRef}
                data={onboardingSlides}
                keyExtractor={(item) => item.key}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <View style={{ width }}>
                        {item.component()}
                    </View>
                )}
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(index);
                }}
            />
            <View style={styles.footer}>
                <Button onPress={handleNext}>
                    {currentIndex === onboardingSlides.length - 1 ? 'Get Started' : 'Next'}
                </Button>
            </View>
        </Layout>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    footer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 30,
    },
});
