export const parseQuizText = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const questions = [];
  let i = 0;

  while (i < lines.length) {
    const qLine = lines[i++]; // e.g. "10. Which ensemble..."
    const qMatch = qLine.match(/^\d+\.\s+(.*)$/);
    if (!qMatch) continue;

    const questionText = qMatch[1];

    const options = [];
    for (let j = 0; j < 4; j++) {
      const line = lines[i++] || '';
      const optMatch = line.match(/^[A-D]\.\s+(.*)$/);
      options.push(optMatch ? optMatch[1] : '');
    }

    const answerLine = lines[i++] || '';
    const ansMatch = answerLine.match(/^Correct Answer:\s+([A-D])\.?\s*(.*)?$/);

    questions.push({
      question: questionText,
      choices: options,
      correctAnswerIndex: 'ABCD'.indexOf(ansMatch?.[1]),
      explanation: ansMatch?.[2] || '',
    });
  }

  return questions;
};
