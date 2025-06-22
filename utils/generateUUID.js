import * as ExpoCrypto from 'expo-crypto';

export async function generateUUID() {
    try {
        const bytes = await ExpoCrypto.getRandomBytesAsync(16);

        // Set version to 4 (UUIDv4)
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        // Set variant to RFC 4122
        bytes[8] = (bytes[8] & 0x3f) | 0x80;

        const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');

        return `${hex.substr(0, 8)}-${hex.substr(8, 4)}-${hex.substr(12, 4)}-${hex.substr(16, 4)}-${hex.substr(20, 12)}`;
    } catch (error) {
        __DEV__ && console.error('❌ Failed to generate UUID:', error);
        return null;
    }
}