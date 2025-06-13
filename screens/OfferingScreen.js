import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import Purchases from 'react-native-purchases';
import { useNavigation } from '@react-navigation/native';

export default function PaywallScreen() {
    const [offering, setOffering] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchOffer = async () => {
            const offerings = await Purchases.getOfferings();
            setOffering(offerings.all['Advanced Membership']);
        };
        fetchOffer();
    }, []);

    if (!offering) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={styles.fullScreen}>
            <RevenueCatUI.Paywall
                options={{ offering }}
                onDismiss={() => navigation.goBack()}
                onPurchaseCancelled={() =>{
                    navigation.goBack();
                    alert('Purchase cancelled. Please try again later.')}
                }
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
});
