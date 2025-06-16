import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import {
    InterstitialAd,
    AdEventType,
    TestIds,
} from 'react-native-google-mobile-ads';

const PROD_AD_UNIT_ID_IOS = 'ca-app-pub-2904800020194076/4851223573';
const PROD_AD_UNIT_ID_ANDROID = 'ca-app-pub-2904800020194076/3865917723';

export const useInterstitialAd = () => {
    const adUnitId = __DEV__
        ? TestIds.INTERSTITIAL
        : Platform.select({
            ios: PROD_AD_UNIT_ID_IOS,
            android: PROD_AD_UNIT_ID_ANDROID,
        });
    const [isLoaded, setIsLoaded] = useState(false);

    const interstitialRef = useRef(
        InterstitialAd.createForAdRequest(adUnitId, {
            requestNonPersonalizedAdsOnly: true,
        })
    );

    useEffect(() => {
        const interstitial = interstitialRef.current;

        const onAdEvent = interstitial.addAdEventListener(AdEventType.LOADED, () => {
            setIsLoaded(true);
        });

        const onAdError = interstitial.addAdEventListener(AdEventType.ERROR, () => {
            setIsLoaded(false);
        });

        interstitial.load();

        return () => {
            onAdEvent();
            onAdError();
        };
    }, []);

    const showAd = () => {
        return new Promise((resolve) => {
            const interstitial = interstitialRef.current;

            if (isLoaded) {
                const onClose = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
                    __DEV__ && console.log('✅ Interstitial ad closed');
                    setIsLoaded(false);
                    interstitial.load(); // preload next
                    resolve();
                    onClose();
                });

                interstitial.show();
            } else {
                __DEV__ && console.log('⚠️ Interstitial ad not ready');
                resolve();
            }
        });
    };

    return {
        showAd,
    };
};
