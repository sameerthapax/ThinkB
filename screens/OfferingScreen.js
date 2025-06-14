import React, { useEffect, useState, useContext } from 'react'; // <--- IMPORTANT: Added useContext here
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native'; // Added Text for message box
import RevenueCatUI from 'react-native-purchases-ui';
import Purchases from 'react-native-purchases';
import { useNavigation } from '@react-navigation/native';
import { SubscriptionContext } from '../context/SubscriptionContext';

export default function PaywallScreen() {
    const [offering, setOffering] = useState(null);
    const [showMessageBox, setShowMessageBox] = useState(false); // State for custom message box
    const [messageBoxText, setMessageBoxText] = useState(''); // Text for custom message box
    const navigation = useNavigation();
    // Destructure 'refresh' from the SubscriptionContext
    const { refresh } = useContext(SubscriptionContext);

    useEffect(() => {
        const fetchOffer = async () => {
            try {
                const offerings = await Purchases.getOfferings();
                // Ensure the offering name matches exactly what you have in RevenueCat
                // For example, if your offering in RevenueCat is named 'Advanced Membership'
                // and it contains the 'AdvancedUser' entitlement.
                setOffering(offerings.all['Advanced Membership']); // Assuming this is your offering name
                console.log('Fetched Offering:', offerings.all['Advanced Membership']);
            } catch (error) {
                console.error('❌ Error fetching offerings in PaywallScreen:', error);
                // Optionally navigate back or show an error to the user if offerings fail to load
                // navigation.goBack();
                setMessageBoxText('Failed to load offerings. Please try again.');
                setShowMessageBox(true);
            }
        };
        fetchOffer();
    }, []); // Runs once on component mount

    // Display a loading indicator while offerings are being fetched
    if (!offering) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={{ marginTop: 10, color: '#666' }}>Loading paywall...</Text>
            </View>
        );
    }

    // Custom message box component (replaces alert())
    const MessageBox = ({ message, onDismiss }) => (
        <View style={styles.messageBoxOverlay}>
            <View style={styles.messageBox}>
                <Text style={styles.messageText}>{message}</Text>
                <Text style={styles.messageButton} onPress={onDismiss}>OK</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.fullScreen}>
            <RevenueCatUI.Paywall
                options={{ offering }}
                // Handle paywall dismissal (user closes it)
                onDismiss={() => navigation.goBack()}
                // Handle purchase cancellation
                onPurchaseCancelled={() => {
                    navigation.goBack();
                    setMessageBoxText('Purchase cancelled. Please try again later.');
                    setShowMessageBox(true);
                }}
                // Handle successful purchase
                onPurchaseCompleted={async (purchase) => {
                    console.log('Purchase completed:', purchase);
                    // Refresh the subscription status in the context
                    await refresh();
                    // Navigate back after successful purchase and refresh
                    navigation.goBack();
                    setMessageBoxText('Purchase successful! Your subscription is now active.');
                    setShowMessageBox(true);
                }}
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
        backgroundColor: '#f9f9f9', // Slightly off-white background
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
        zIndex: 1000, // Ensure it's above other content
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
        color: '#007aff', // iOS blue
        fontWeight: '600',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        backgroundColor: '#e0f7fa', // Light blue background
    },
});
