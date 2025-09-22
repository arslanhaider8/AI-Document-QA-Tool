// utils/textProcessor.js

/**
 * Splits text into intelligent chunks with sentence-based boundaries and overlap
 * @param {string} text - The text to chunk
 * @param {number} chunkSize - Maximum words per chunk
 * @param {number} overlap - Number of words to overlap between chunks
 * @returns {Array<string>} Array of text chunks
 */
function chunkText(text, chunkSize = 500, overlap = 50) {
  // Clean and normalize text
  const cleanText = text.replace(/\s+/g, " ").trim();
  const sentences = cleanText
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0);
  const chunks = [];

  let currentChunk = "";
  let wordCount = 0;

  for (const sentence of sentences) {
    const sentenceWords = sentence.trim().split(" ").length;

    if (wordCount + sentenceWords > chunkSize && currentChunk) {
      chunks.push(currentChunk.trim());

      // Add overlap by keeping last few sentences
      const overlapSentences = currentChunk
        .split(/[.!?]+/)
        .slice(-overlap / 10);
      currentChunk =
        overlapSentences.join(". ") +
        (overlapSentences.length > 0 ? ". " : "") +
        sentence;
      wordCount = currentChunk.split(" ").length;
    } else {
      currentChunk += (currentChunk ? ". " : "") + sentence;
      wordCount += sentenceWords;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [cleanText];
}

/**
 * Calculates relevance score between a text chunk and a question
 * @param {string} chunk - Text chunk to analyze
 * @param {string} question - User question
 * @returns {number} Relevance score
 */
function calculateRelevanceScore(chunk, question) {
  const chunkLower = chunk.toLowerCase();
  const questionLower = question.toLowerCase();
  const questionWords = questionLower
    .split(/\s+/)
    .filter((word) => word.length > 2);

  let score = 0;
  let exactMatches = 0;

  for (const word of questionWords) {
    // Exact word matches
    const wordMatches = (
      chunkLower.match(new RegExp(`\\b${word}\\b`, "g")) || []
    ).length;
    score += wordMatches * 2;
    if (wordMatches > 0) exactMatches++;

    // Partial matches
    if (chunkLower.includes(word)) {
      score += 0.5;
    }
  }

  // Bonus for having multiple question words
  if (exactMatches > 1) {
    score += exactMatches * 1.5;
  }

  // Bonus for question words appearing close together
  let proximity = 0;
  for (let i = 0; i < questionWords.length - 1; i++) {
    const word1Index = chunkLower.indexOf(questionWords[i]);
    const word2Index = chunkLower.indexOf(questionWords[i + 1]);
    if (word1Index !== -1 && word2Index !== -1) {
      const distance = Math.abs(word2Index - word1Index);
      if (distance < 100) {
        // words within 100 characters
        proximity += (100 - distance) / 100;
      }
    }
  }
  score += proximity;

  return score;
}

export { chunkText, calculateRelevanceScore };
