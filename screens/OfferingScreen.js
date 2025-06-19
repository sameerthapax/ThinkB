import React, { useEffect, useState, useContext } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import Purchases from 'react-native-purchases';
import { useNavigation } from '@react-navigation/native';
import { SubscriptionContext } from '../context/SubscriptionContext';

export default function PaywallScreen() {
    const [offering, setOffering] = useState(null);
    const [showMessageBox, setShowMessageBox] = useState(false);
    const [messageBoxText, setMessageBoxText] = useState('');
    const [isMounted, setIsMounted] = useState(true); // Prevent setting state after unmount

    const navigation = useNavigation();
    const { refresh } = useContext(SubscriptionContext);

    useEffect(() => {
        setIsMounted(true);
        const fetchOffer = async () => {
            try {
                const offerings = await Purchases.getOfferings();
                const selected = offerings.all['Advanced Membership'];
                if (selected) {
                    setOffering(selected);
                    console.log('✅ Fetched Offering:', selected);
                } else {
                    throw new Error('Offering not found');
                }
            } catch (error) {
                console.error('❌ Error fetching offerings:', error);
                if (isMounted) {
                    setMessageBoxText('Failed to load offerings. Please try again later.');
                    setShowMessageBox(true);
                }
            }
        };
        fetchOffer();
        return () => setIsMounted(false); // Cleanup
    }, []);

    const handlePurchaseCompleted = async (purchase) => {
        try {
            console.log('✅ Purchase completed:', purchase);
            await refresh();
            navigation.goBack();
            setMessageBoxText('Purchase successful! Your subscription is now active.');
            setShowMessageBox(true);
        } catch (err) {
            console.error('❌ Error post-purchase:', err);
            setMessageBoxText('Something went wrong after purchase. Please restart the app.');
            setShowMessageBox(true);
        }
    };

    const MessageBox = ({ message, onDismiss }) => (
        <View style={styles.messageBoxOverlay}>
            <View style={styles.messageBox}>
                <Text style={styles.messageText}>{message}</Text>
                <Text style={styles.messageButton} onPress={onDismiss}>OK</Text>
            </View>
        </View>
    );

    if (!offering) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={{ marginTop: 10, color: '#666' }}>Loading paywall...</Text>
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
                        setMessageBoxText('Purchase cancelled. Please try again later.');
                        setShowMessageBox(true);
                    } catch (err) {
                        console.error('⚠️ Purchase cancel error:', err);
                    }
                }}
                onPurchaseCompleted={handlePurchaseCompleted}
            />
            {showMessageBox && (
                <MessageBox
                    message={messageBoxText}
                    onDismiss={() => setShowMessageBox(false)}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    fullScreen: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    messageBoxOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    messageBox: {
        width: 280,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    messageText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    messageButton: {
        fontSize: 16,
        color: '#007aff',
        fontWeight: '600',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        backgroundColor: '#e0f7fa',
    },
});