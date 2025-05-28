export const parseQuizJson = (text) => {
  try {
    // Extract the JSON portion from any surrounding log or text
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']') + 1;

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('JSON array not found in the input.');
    }

    const jsonString = text.slice(jsonStart, jsonEnd);
    const rawArray = JSON.parse(jsonString);

    const parsed = rawArray.map((q) => {
      const correctAnswerIndex = q.choices.indexOf(q.answer);
      return {
        question: q.question,
        choices: q.choices,
        correctAnswerIndex,
        explanation: q.answer,
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
