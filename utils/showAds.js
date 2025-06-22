import { Platform, StatusBar } from 'react-native';
import mobileAds, {
    InterstitialAd,
    AdEventType,
    MaxAdContentRating,
    TestIds,
} from 'react-native-google-mobile-ads';

const PROD_AD_UNIT_ID_IOS = 'ca-app-pub-2904800020194076/4405109823';
const PROD_AD_UNIT_ID_ANDROID = 'ca-app-pub-2904800020194076/3865917723';

const adUnitId = __DEV__
    ? TestIds.INTERSTITIAL
    :Platform.select({
        ios: PROD_AD_UNIT_ID_IOS,
        android: PROD_AD_UNIT_ID_ANDROID,
    });

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: true,
});

let initialized = false;
let isLoaded = false;

export const initAds = async () => {
    if (initialized) return;
    initialized = true;

    await mobileAds().setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.PG,
        tagForChildDirectedTreatment: true,
        tagForUnderAgeOfConsent: true,
        testDeviceIdentifiers: ['EMULATOR'], // Replace if needed
    });

    await mobileAds().initialize();
    interstitial.load();

    interstitial.addAdEventListener(AdEventType.LOADED, () => {
        isLoaded = true;
        __DEV__ && console.log('✅ Interstitial ad loaded');
    });

    interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        isLoaded = false;
        interstitial.load(); // preload next
        if (Platform.OS === 'ios') StatusBar.setHidden(false);
    });

    interstitial.addAdEventListener(AdEventType.OPENED, () => {
        if (Platform.OS === 'ios') StatusBar.setHidden(true);
    });
};

export const showInterstitialAd = () =>
    new Promise((resolve) => {
        if (!isLoaded) {
            __DEV__ && console.log('⚠️ Ad not loaded yet');
            return resolve();
        }

        try {
            interstitial.show();
        } catch (e) {
            __DEV__ && console.error('❌ Failed to show ad:', e);
        } finally {
            resolve();
        }
    });