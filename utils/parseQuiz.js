export const parseQuizJson = (text) => {
  try {
    // Step 1: Locate the JSON array in the text
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']') + 1;

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('JSON array not found in the input.');
    }

    const jsonString = text.slice(jsonStart, jsonEnd);
    const rawArray = JSON.parse(jsonString);

    const parsed = rawArray.map((q) => {
      // If format is using 'answer', calculate the index
      if (typeof q.correctAnswerIndex === 'undefined' && q.answer) {
        const index = q.choices.indexOf(q.answer);
        return {
          question: q.question,
          choices: q.choices,
          correctAnswerIndex: index,
          explanation: q.answer,
        };
      }

      // If format already has correctAnswerIndex and explanation
      return {
        question: q.question,
        choices: q.choices,
        correctAnswerIndex: q.correctAnswerIndex,
        explanation: q.explanation || q.choices[q.correctAnswerIndex] || '',
      };
    }).filter(q =>
        q.question &&
        Array.isArray(q.choices) &&
        q.choices.length === 4 &&
        q.correctAnswerIndex >= 0
    );

    return parsed;
  } catch (err) {
    console.error('❌ Failed to parse quiz JSON:', err.message);
    return [];
  }
};
