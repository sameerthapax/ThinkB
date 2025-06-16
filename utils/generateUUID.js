import * as ExpoCrypto from 'expo-crypto';

export async function generateUUID() {
    const bytes = await ExpoCrypto.getRandomBytesAsync(16);
    // Convert to UUID format manually
    const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.substr(0, 8)}-${hex.substr(8, 4)}-${hex.substr(12, 4)}-${hex.substr(16, 4)}-${hex.substr(20, 12)}`;
}