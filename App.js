import React, {useContext, useEffect, useState} from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry, Icon } from '@ui-kitten/components';
import { EvaIconsPack, TopNavigationAction} from '@ui-kitten/eva-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CurvedBottomBar } from 'react-native-curved-bottom-bar';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

// Screens
import HomeScreen from './screens/HomeScreen';
import UploadScreen from './screens/UploadScreen';
import QuizScreen from './screens/QuizScreen';
import HistoryScreen from './screens/QuizHistoryScreen';
import StudyMaterialsScreen from './screens/UploadHistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import ExtractedTextScreen from './screens/ExtractedTextScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import QuizBuilderScreenStart from './screens/QuizBuilderScreenStart';
import QuizBuilderScreenCreate from './screens/QuizBuilderScreenCreate';
import QuizBuilderScreenPreview from './screens/QuizBuilderPreviewScreen';
import PaywallScreen from './screens/OfferingScreen';
import PaywallScreenPremium from './screens/OfferingScreenPremium';
import MyQuizScreen from './screens/MyQuizScreen';


//utils
import { checkStreakOnLaunch } from './utils/checkStreakOnLaunch';
import { initializeAppStorage } from './utils/initializeAppStorage';
import { runBackgroundQuizGeneration, TASK_NAME } from './utils/backgroundTask';
import { SubscriptionProvider } from './context/SubscriptionContext';

const Stack = createNativeStackNavigator();


const TabNavigator = () => (
    <CurvedBottomBar.Navigator
        style={styles.bottomBar}
        height={85}
        circleWidth={70}
        bgColor="rgba(0,0,0,1)"
        initialRouteName="Home"
        borderTopLeftRight
        renderCircle={({ navigate, selectedTab, routeName }) => {
            const isSelected = routeName === selectedTab;
            const size= isSelected?40:30
            return(
            <View style={isSelected? styles.circleButtonSelected : styles.circleButton}>
                <Icon
                    name="file-add"
                    fill={isSelected ? 'rgb(0,0,0)' : '#ffffff'}
                    style={{ width: size, height: size }}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Hard);
                        navigate('Upload')}}
                />
            </View>
        )}}
        tabBar={({ routeName, selectedTab, navigate }) => {
            const icons = {
                Home: 'home',
                Quiz: 'bulb',
                History: 'clock',
                Settings: 'settings',
            };
            const isSelected = routeName === selectedTab;
            const size = isSelected ? 44 : 38; // selected icon is larger
            return (
                <Icon
                    name={icons[routeName]}
                    fill={isSelected ? '#7c3aed' : 'rgb(255,255,255)'}
                    style={{
                        width: size, height: size, marginLeft: '50%', left: '-25%', marginBottom: 10
                    }}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        navigate(routeName)
                    }}
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

TaskManager.defineTask(TASK_NAME, async () => {
    console.log('📡 Running background fetch task...');
    return await runBackgroundQuizGeneration()
        .then(() => BackgroundFetch.BackgroundFetchResult.NewData)
        .catch(err => {
            console.error('❌ Background task failed:', err);
            return BackgroundFetch.BackgroundFetchResult.Failed;
        });
});

const registerBackgroundTask = async () => {
    try {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
        if (!isRegistered) {
            await BackgroundFetch.registerTaskAsync(TASK_NAME, {
                minimumInterval: 60 * 60 * 24, // every 24 hours
                stopOnTerminate: false,
                startOnBoot: true,
            });
            console.log('✅Background task registered');
        }
    } catch (err) {
        console.error('❌ Error registering background task:', err);
    }
};


export default function App() {
    const [initialRoute, setInitialRoute] = useState(null);

    useEffect(() => {
        registerBackgroundTask();
    }, []);
    useEffect(() => {
        const checkFirstLaunch = async () => {
            const value = await AsyncStorage.getItem('hasSeenOnboarding');
            if (value === null) {
                // First launch, show onboarding
                await initializeAppStorage(); // Set all default values
                setInitialRoute('Onboarding');
                await AsyncStorage.setItem('hasSeenOnboarding', 'true');
            } else {
                // Not first launch, show main app
                setInitialRoute('ThinkB');

            }
        };
        checkFirstLaunch();
        checkStreakOnLaunch();
    }, []);

    if (!initialRoute) return null; // or a splash screen

    return (
        <>
            <SubscriptionProvider>
            <IconRegistry icons={EvaIconsPack} />
            <ApplicationProvider {...eva} theme={eva.light}>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }} id={'navigator'}>
                        <Stack.Screen name="Onboarding" component={OnboardingScreen}  />
                        <Stack.Screen name="ThinkB" component={TabNavigator} />
                        <Stack.Screen name="ExtractedText" component={ExtractedTextScreen} options={{ headerShown: true }} />
                        <Stack.Screen name="Materials" component={StudyMaterialsScreen} options={{ headerShown: true }} />
                        <Stack.Screen name="QuizBuilderStart" component={QuizBuilderScreenStart} options={{ headerShown: true, title: 'Quiz Builder'}} />
                        <Stack.Screen name="QuizBuilderCreate" component={QuizBuilderScreenCreate} options={{ headerShown: true, title: 'Quiz Builder'}} />
                        <Stack.Screen name="QuizBuilderPreview" component={QuizBuilderScreenPreview} options={{ headerShown: true, title: 'Quiz Builder'}} />
                        <Stack.Screen name="MyQuizzes" component={MyQuizScreen} options={{ headerShown: true, title: 'Quiz Builder'}} />
                        <Stack.Screen name="AdvancedOffering" component={PaywallScreen} options={{ headerShown: false}} />
                        <Stack.Screen name="PremiumOffering" component={PaywallScreenPremium} options={{ headerShown: false}} />
                    </Stack.Navigator>
                </NavigationContainer>
            </ApplicationProvider>
            </SubscriptionProvider>
        </>
    );
}


const styles = StyleSheet.create({
    bottomBar: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: -1,
    },
    circleButton: {
        width: 65,
        height: 65,
        borderRadius:"50%",
        backgroundColor: '#7c3aed',
        alignItems: 'center',
        justifyContent: 'center',
        bottom: 18,
        shadowColor: 'rgba(0,0,0,0.74)',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 5 },
    },
    circleButtonSelected: {
        width: 72,
        height: 72,
        borderRadius: "50%",
        backgroundColor: '#7c3aed',
        alignItems: 'center',
        justifyContent: 'center',
        bottom: 35,
        shadowColor: 'rgba(0,0,0,0.74)',
        shadowColor: '#000',
        shadowOpacity: 0.7,
        shadowOffset: { width: 0, height: 10 },
    },
});
