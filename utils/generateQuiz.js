import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sha256 } from 'js-sha256';

export async function generateQuizFromText(content, options = {}, abortSignal = null, userStatus) {
    const {
        numberOfQuestions = 5,
        difficulty = 'easy',
        generationMode = 'Manual',
    } = options;

    const hashKey = sha256(content + numberOfQuestions + difficulty);
    const cacheKey = `quiz-cache-${hashKey}`;

    try {
        // 1. Check cache
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached && generationMode === 'Manual') {
            console.log('✅ Returning cached quiz');
            return cached;
        }

        // 2. Build prompt
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
  },
  ...
]

Study Material:
${content}
`;

        try {
            const response = await axios.post(
                'https://thinkb.xyz/generate',
                {
                    prompt: prompt,
                    stream: false,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key':
                            userStatus === 'pro'
                                ? 'pro-xyz@thinkb'
                                : userStatus === 'advanced'
                                    ? 'advanced-xyz@thinkb'
                                    : 'normal-xyz@thinkb',
                    },
                    signal: abortSignal,
                }
            );

            const quiz = response.data.response;
            await AsyncStorage.setItem(cacheKey, quiz);
            console.log('✅ Quiz generated and cached successfully (LLaMA):', quiz);
            return quiz;
        } catch (llamaError) {
            if (llamaError.name === 'CanceledError' || llamaError.message.includes('aborted')) {
                // 🛑 Don't fall back if user aborted
                console.warn('🛑 Aborted — no fallback to ChatGPT.');
                return null;
            }

            // 🟡 LLaMA failed for other reason — fallback allowed
            console.warn('⚠️ LLaMA server failed, falling back to ChatGPT:', llamaError.message);
        }



    } catch (error) {
        console.error('❌ Quiz generation failed:', error.toString());
        return null;
    }
}