import React, { useRef, useState } from 'react';
import { FlatList, Dimensions, StyleSheet, View, Alert } from 'react-native';
import { Layout, Button } from '@ui-kitten/components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onboardingSlides } from '../utils/onBoardingData';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);

    const handleNext = () => {
        if (currentIndex < onboardingSlides.length - 1) {
            try {
                flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
            } catch (e) {
                __DEV__ && console.warn('⚠️ Failed to scroll to next onboarding screen:', e);
            }
        } else {
            finishOnboarding();
        }
    };

    const finishOnboarding = async () => {
        try {
            await AsyncStorage.setItem('hasSeenOnboarding', 'true');
            navigation.replace('ThinkB');
        } catch (err) {
            __DEV__ && console.error('❌ Failed to save onboarding state or navigate:', err);
            Alert.alert('Error', 'Failed to finish onboarding. Please try again.');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom']}>
            <Layout style={{ flex: 1 }}>
                <FlatList
                    ref={flatListRef}
                    data={onboardingSlides}
                    keyExtractor={(item) => item.key?.toString() || Math.random().toString()}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <View style={{ width }}>
                            {typeof item.component === 'function' ? (
                                <item.component isActive={currentIndex === index} />
                            ) : (
                                <View style={{ padding: 20 }}>
                                    <Button appearance="ghost">Invalid Slide Component</Button>
                                </View>
                            )}
                        </View>
                    )}
                    onMomentumScrollEnd={(event) => {
                        const index = Math.round(event.nativeEvent.contentOffset.x / width);
                        if (index >= 0 && index < onboardingSlides.length) {
                            setCurrentIndex(index);
                        }
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