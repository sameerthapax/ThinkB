import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sha256 } from 'js-sha256';

export async function generateQuizFromText(content, options = {}, abortSignal = null) {
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

        // 3. Try LLaMA first
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
                        'x-api-key': 'unlimited-xyz@thinkb',
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

        // 4. Fallback to OpenAI ChatGPT only if not aborted
        const openaiResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer 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`,
                },
                signal: abortSignal
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