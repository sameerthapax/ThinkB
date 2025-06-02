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



        const response = await axios.post(
            'http://5.161.80.216:3000/generate',
            {
                model: 'qwen2.5:3b',
                prompt: prompt,
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
        console.log('✅ Quiz generated and cached successfully:',quiz );
        return quiz;
    } catch (error) {
        console.error('Llama error:', error.message);
        return null;
    }
}
