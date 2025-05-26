export const parseQuizText = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const questions = [];
  let i = 0;

  while (i < lines.length) {
    const qLine = lines[i++];
    const qMatch = qLine.match(/^\d+\.\s+(.*)$/);
    if (!qMatch) continue;

    const questionText = qMatch[1];

    const options = [];
    for (let j = 0; j < 4; j++) {
      const line = lines[i++] || '';
      const optMatch = line.match(/^[A-D][.)]?\s+(.*)$/); // Handles A. or A)
      options.push(optMatch ? optMatch[1].trim() : '');
    }

    const answerLine = lines[i++] || '';
    console.log('📌 Answer Line Raw:', answerLine);

    const ansMatch = answerLine.match(/^Correct\s*Answer[:\-]?\s*([A-D])[.)]?\s*(.*)$/i);
    console.log('✅ Parsed Answer:', ansMatch?.[1], 'Explanation:', ansMatch?.[2]);

    questions.push({
      question: questionText,
      choices: options,
      correctAnswerIndex: 'ABCD'.indexOf(ansMatch?.[1]),
      explanation: ansMatch?.[2] || '',
    });
  }

  return questions;
};
