import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry, Icon } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CurvedBottomBar } from 'react-native-curved-bottom-bar';

// Screens
import HomeScreen from './screens/HomeScreen';
import UploadScreen from './screens/UploadScreen';
import QuizScreen from './screens/QuizScreen';
import HistoryScreen from './screens/QuizHistoryScreen';
import StudyMaterialsScreen from './screens/UploadHistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import ExtractedTextScreen from './screens/ExtractedTextScreen';
import OnboardingScreen from './screens/OnboardingScreen'; // 👉 make sure this screen exists

const Stack = createNativeStackNavigator();

const TabNavigator = () => (
    <CurvedBottomBar.Navigator
        style={styles.bottomBar}
        height={80}
        circleWidth={65}
        bgColor="#D9D9D999"
        initialRouteName="Home"
        borderTopLeftRight
        renderCircle={({ navigate }) => (
            <View style={styles.circleButton}>
                <Icon
                    name="file-add"
                    fill="#fff"
                    style={{ width: 30, height: 30 }}
                    onPress={() => navigate('Upload')}
                />
            </View>
        )}
        tabBar={({ routeName, selectedTab, navigate }) => {
            const icons = {
                Home: 'home',
                Quiz: 'bulb',
                History: 'clock',
                Settings: 'settings',
            };
            return (
                <Icon
                    name={icons[routeName]}
                    fill={routeName === selectedTab ? '#7c3aed' : '#ccc'}
                    style={{ width: 34, height: 34, marginLeft: '50%', left: '-25%' }}
                    onPress={() => navigate(routeName)}
                />
            );
        }}
    >
        <CurvedBottomBar.Screen name="Home" position="LEFT" component={HomeScreen} />
        <CurvedBottomBar.Screen name="Quiz" position="LEFT" component={QuizScreen} />
        <CurvedBottomBar.Screen name="History" position="RIGHT" component={HistoryScreen} />
        <CurvedBottomBar.Screen name="Settings" position="RIGHT" component={SettingsScreen} />
        <CurvedBottomBar.Screen name="Upload" position="CENTER" component={UploadScreen} />
    </CurvedBottomBar.Navigator>
);

export default function App() {
    const [initialRoute, setInitialRoute] = useState(null);

    useEffect(() => {
        const checkFirstLaunch = async () => {
            const value = await AsyncStorage.getItem('hasSeenOnboarding');
            setInitialRoute(value === 'true' ? 'ThinkB' : 'Onboarding');
        };
        checkFirstLaunch();
    }, []);

    if (!initialRoute) return null; // or a splash screen

    return (
        <>
            <IconRegistry icons={EvaIconsPack} />
            <ApplicationProvider {...eva} theme={eva.light}>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }} id={'navigator'}>
                        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                        <Stack.Screen name="ThinkB" component={TabNavigator} />
                        <Stack.Screen name="ExtractedText" component={ExtractedTextScreen} options={{ headerShown: true }} />
                        <Stack.Screen name="Materials" component={StudyMaterialsScreen} options={{ headerShown: true }} />
                    </Stack.Navigator>
                </NavigationContainer>
            </ApplicationProvider>
        </>
    );
}


const styles = StyleSheet.create({
    bottomBar: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circleButton: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
        backgroundColor: '#7c3aed',
        alignItems: 'center',
        justifyContent: 'center',
        bottom: 18,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 5 },
    },
});
