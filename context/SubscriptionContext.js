import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeHashedApiKey } from '../utils/initializeAppStorage';


export const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
    // State to hold the user's entitlement status and loading state
    const [userEntitlements, setUserEntitlements] = useState({
        isPro: false,
        isAdv: false,
        loading: true,
    });

    // Memoize the checkSubscription function to ensure it's stable across renders
    useEffect(() => {
        const persistTier = async () => {
            try {
                let tier = 'normal';
                if (userEntitlements.isPro) tier = 'pro';
                else if (userEntitlements.isAdv) tier = 'advanced';
                await AsyncStorage.setItem('user-tier', tier);
                await initializeHashedApiKey(tier);
                console.log('💾 Stored user-tier in AsyncStorage:', tier);
            } catch (err) {
                console.error('❌ Failed to persist user tier:', err);
            }
        };

        if (!userEntitlements.loading) {
            persistTier();
        }
    }, [userEntitlements]);
    // This is important for useEffect dependencies and listener cleanups
    const checkSubscription = useCallback(async () => {
        try {
            setUserEntitlements(prev => ({ ...prev, loading: true })); // Set loading true before fetch
            const customerInfo = await Purchases.getCustomerInfo();
            console.log('RevenueCat Customer Info after checkSubscription:', customerInfo);
            // Assuming 'PremiumUser' and 'AdvancedUser' are your entitlement IDs in RevenueCat
            setUserEntitlements({
                isPro: !!customerInfo.entitlements.active['PremiumUser'], // Double negation to ensure boolean
                isAdv: !!customerInfo.entitlements.active['AdvancedUser'], // Double negation to ensure boolean
                loading: false,
            });
            console.log('isPro set to:', !!customerInfo.entitlements.active['PremiumUser']);
            console.log('isAdv set to:', !!customerInfo.entitlements.active['AdvancedUser']);
        } catch (e) {
            console.error('❌ Error checking subscription:', e);
            setUserEntitlements({ isPro: false, isAdv: false, loading: false });
        }
    }, []); // Empty dependency array means this function is created once

    // Effect for RevenueCat configuration and initial offerings check
    useEffect(() => {
        __DEV__ && Purchases.setLogLevel(LOG_LEVEL.VERBOSE); // Set log level for detailed debugging
        if (Platform.OS === 'ios') {
            // Configure RevenueCat with your API key for iOS
            Purchases.configure({ apiKey: 'appl_KbqCFBlFhDbkCzEcVhzVzaCtkJK' });
        }
        // Fetch offerings to ensure they are loaded, primarily for debugging/logging purposes here
        Purchases.getOfferings().then((offerings) => {
            if (offerings.current !== null) {
                // Log all available offerings for verification
                console.log('Available Offerings:', offerings.all);
            } else {
                console.log('No offerings available');
            }
        }).catch((error) => {
            console.error('Error loading offerings:', error);
        });
    }, []); // Runs once on component mount

    // Effect for initial subscription check and setting up the customer info listener
    useEffect(() => {
        // Perform an initial check when the component mounts
        checkSubscription();

        // Add a listener to automatically update subscription status
        // whenever RevenueCat's customer info changes (e.g., after a purchase, restore)
        Purchases.addCustomerInfoUpdateListener(checkSubscription);

        // Cleanup function: Remove the listener when the component unmounts
        return () => {
            Purchases.removeCustomerInfoUpdateListener(checkSubscription);
        };
    }, [checkSubscription]); // Reruns if checkSubscription changes (it won't because of useCallback)

    // The context value provided to consumers
    const contextValue = {
        isProUser: userEntitlements.isPro,
        isAdvancedUser: userEntitlements.isAdv,
        loading: userEntitlements.loading,
        refresh: checkSubscription, // Provide the memoized checkSubscription as the refresh function
    };

    return (
        <SubscriptionContext.Provider value={contextValue}>
            {children}
        </SubscriptionContext.Provider>
    );
};
