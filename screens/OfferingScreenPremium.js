import React, { useEffect, useState, useContext } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import Purchases from 'react-native-purchases';
import { useNavigation } from '@react-navigation/native';
import { SubscriptionContext } from '../context/SubscriptionContext';

export default function PaywallScreenPremium() {
    const [offering, setOffering] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const navigation = useNavigation();
    const { refresh } = useContext(SubscriptionContext);

    useEffect(() => {
        let isMounted = true;

        const fetchOffer = async () => {
            try {
                const offerings = await Purchases.getOfferings();
                const selected = offerings?.all?.['Premium Membership'];
                if (selected && isMounted) {
                    setOffering(selected);
                    console.log('✅ Premium offering loaded:', selected);
                } else {
                    throw new Error('Premium offering not found');
                }
            } catch (err) {
                console.error('❌ Error fetching Premium offering:', err);
                if (isMounted) {
                    setErrorMessage('Failed to load premium options. Please try again later.');
                }
            }
        };

        fetchOffer();

        return () => {
            isMounted = false;
        };
    }, []);

    if (errorMessage) {
        return (
            <View style={styles.loaderContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
                <Text onPress={() => navigation.goBack()} style={styles.dismissText}>Go Back</Text>
            </View>
        );
    }

    if (!offering) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 10, color: '#666' }}>Loading premium options...</Text>
            </View>
        );
    }

    return (
        <View style={styles.fullScreen}>
            <RevenueCatUI.Paywall
                options={{ offering }}
                onDismiss={() => navigation.goBack()}
                onPurchaseCancelled={() => {
                    try {
                        navigation.goBack();
                        alert('Purchase cancelled. Please try again later.');
                    } catch (e) {
                        console.error('⚠️ Cancel handler failed:', e);
                    }
                }}
                onPurchaseCompleted={async (purchase) => {
                    try {
                        console.log('✅ Purchase completed:', purchase);
                        await refresh();
                        navigation.goBack();
                    } catch (err) {
                        console.error('❌ Failed after purchase:', err);
                        alert('Purchase succeeded but something went wrong. Restart the app if needed.');
                    }
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    fullScreen: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    errorText: {
        fontSize: 16,
        color: '#cc0000',
        textAlign: 'center',
        marginBottom: 12,
        paddingHorizontal: 20,
    },
    dismissText: {
        fontSize: 16,
        color: '#007aff',
        fontWeight: '500',
        marginTop: 8,
    },
});