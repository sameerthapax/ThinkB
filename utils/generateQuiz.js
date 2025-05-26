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
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
            console.log('✅ Returning cached quiz');
            return cached;
        }

        const prompt = `
Generate ${numberOfQuestions} ${difficulty} multiple-choice questions based on the following study material. 
Each question should have 4 options (A, B, C, D), and clearly indicate the correct answer.

Content:
${content}
`;

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );

        const quiz = response.data.choices[0].message.content;
        await AsyncStorage.setItem(cacheKey, quiz);
        return quiz;
    } catch (error) {
        console.error('OpenAI API error:', error.message);
        return null;
    }
}
