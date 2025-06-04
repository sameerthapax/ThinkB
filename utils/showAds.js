import { useEffect, useRef } from 'react';
import {
    InterstitialAd,
    AdEventType,
    TestIds,
} from 'react-native-google-mobile-ads';

const PROD_AD_UNIT_ID = 'ca-app-pub-2904800020194076/4851223573';

export const useInterstitialAd = () => {
    const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : PROD_AD_UNIT_ID;
    const interstitialRef = useRef(
        InterstitialAd.createForAdRequest(adUnitId, {
            requestNonPersonalizedAdsOnly: true,
        })
    );

    useEffect(() => {
        interstitialRef.current.load();
    }, []);

    const showAd = () => {
        return new Promise((resolve) => {
            const interstitial = interstitialRef.current;

            if (interstitial?.loaded) {
                const unsubscribe = interstitial.addAdEventListener(
                    AdEventType.CLOSED,
                    () => {
                        console.log('✅ Interstitial ad closed');
                        resolve();
                        unsubscribe(); // cleanup
                        interstitial.load(); // preload next ad
                    }
                );

                interstitial.show();
            } else {
                console.log('⚠️ Interstitial ad not yet loaded');
                resolve(); // fallback
            }
        });
    };

    return {
        showAd,
    };
};
