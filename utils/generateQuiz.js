import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sha256 } from 'js-sha256';
import * as SecureStore from 'expo-secure-store';

export async function generateQuizFromText(content, options = {}, abortSignal = null, userStatus) {
    const {
        numberOfQuestions = 5,
        difficulty = 'easy',
        generationMode = 'Manual',
    } = options;

    const hashKey = sha256(content + numberOfQuestions + difficulty);
    const cacheKey = `quiz-cache-${hashKey}`;

    try {
        // 1. Try cache
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached && generationMode === 'Manual') {
            __DEV__ && console.log('✅ Returning cached quiz');
            return cached;
        }

        // 2. Prepare prompt
        const prompt = `
Generate ${numberOfQuestions} ${difficulty} multiple-choice questions based on the following study material. 
Each question should have 4 options (A, B, C, D), and clearly indicate the correct answer index (0-3).

⚠️ Return the result as a JSON array of objects in the following format (do not include any explanation outside the JSON):

[
  {
    "question": "Your question here?",
    "choices": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 1,
    "explanation": "Short explanation of the correct answer"
  }
]

Study Material:
${content}
`;

        // 3. Get API Key
        const apiKey = await SecureStore.getItemAsync('api-key');
        if (!apiKey) {
            __DEV__ && console.error('❌ No API key found in secure storage.');
            return null;
        }

        // 4. Call middleware API
        try {
            const response = await axios.post(
                'https://thinkb.xyz/generate',
                { prompt, stream: false },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': apiKey,
                    },
                    signal: abortSignal,
                }
            );

            const quiz = response.data?.response;

            if (!quiz || typeof quiz !== 'string') {
                __DEV__ && console.error('❌ Invalid quiz response format:', response.data);
                return null;
            }

            await AsyncStorage.setItem(cacheKey, quiz);
            __DEV__ && console.log('✅ Quiz generated and cached successfully:', quiz);
            return quiz;
        } catch (llamaError) {
            if (llamaError.name === 'CanceledError' || llamaError.message?.includes('aborted')) {
                __DEV__ && console.warn('🛑 Request aborted by user.');
                return null;
            }

            __DEV__ && console.warn('⚠️ LLaMA backend failed, reason:', llamaError.message);
            return 'Failed';
        }

    } catch (error) {
        __DEV__ && console.error('❌ Unexpected error during quiz generation:', error);
        return null;
    }
}