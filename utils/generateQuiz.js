import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OPENAI_API_KEY } from '@env';
import { sha256 } from 'js-sha256';

export async function generateQuizFromText(content, options = {}) {
    const {
        numberOfQuestions = 10,
        difficulty = 'medium',
    } = options;

    const hashKey = sha256(content + numberOfQuestions + difficulty);
    const cacheKey = `quiz-cache-${hashKey}`;

    try {
        // 1. Try cache first
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
            console.log('✅ Returning cached quiz');
            return cached;
        }

        // 2. Build common prompt
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

        // 3. Try primary LLaMA server
        try {
            const response = await axios.post(
                'https://thinkb.xyz/generate',
                {
                    model: 'qwen2.5:3b',
                    prompt,
                    stream: false,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': 'f/@*(w*Q3l`tfZI',
                    },
                }
            );

            const quiz = response.data.response;
            await AsyncStorage.setItem(cacheKey, quiz);
            console.log('✅ Quiz generated and cached successfully (LLaMA):', quiz);
            return quiz;
        } catch (llamaError) {
            console.warn('⚠️ LLaMA server failed, falling back to ChatGPT:', llamaError.message);
        }

        // 4. Fallback to ChatGPT API
        const openaiResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );

        const chatResponse = openaiResponse.data.choices[0].message.content;
        await AsyncStorage.setItem(cacheKey, chatResponse);
        console.log('✅ Quiz generated and cached successfully (ChatGPT):', chatResponse);
        return chatResponse;

    } catch (error) {
        console.error('❌ Quiz generation failed:', error.toString());
        return null;
    }
}
