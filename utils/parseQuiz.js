export const parseQuizJson = (text) => {
  try {
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']') + 1;

    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
      throw new Error('⚠️ JSON array not found or malformed in AI response.');
    }

    const jsonString = text.slice(jsonStart, jsonEnd).trim();

    let rawArray;
    try {
      rawArray = JSON.parse(jsonString);
    } catch (parseErr) {
      throw new Error('🧨 JSON.parse failed: ' + parseErr.message);
    }

    if (!Array.isArray(rawArray)) {
      throw new Error('🧩 Parsed content is not an array.');
    }

    const parsed = rawArray
        .map((q, i) => {
          if (
              !q ||
              typeof q.question !== 'string' ||
              !Array.isArray(q.choices) ||
              q.choices.length !== 4
          ) {
            __DEV__ && console.warn(`⚠️ Skipping invalid question at index ${i}`);
            return null;
          }

          // Determine the correctAnswerIndex
          let index = q.correctAnswerIndex;
          if (typeof index === 'undefined' && q.answer) {
            index = q.choices.indexOf(q.answer);
          }

          if (typeof index !== 'number' || index < 0 || index > 3) {
            __DEV__ && console.warn(`⚠️ Invalid or missing answer index at question ${i}`);
            return null;
          }

          return {
            question: q.question.trim(),
            choices: q.choices.map((c) => c.trim()),
            correctAnswerIndex: index,
            explanation:
                typeof q.explanation === 'string'
                    ? q.explanation.trim()
                    : q.choices[index] || '',
          };
        })
        .filter(Boolean); // Filter out any nulls from bad questions

    return parsed;
  } catch (err) {
    __DEV__ && console.error('❌ Failed to parse quiz JSON:', err.message);
    return [];
  }
};