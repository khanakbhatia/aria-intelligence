const VADER_LEXICON: Record<string, number> = {
  // Positive words
  great: 3.1,
  love: 3.2,
  happy: 2.7,
  excellent: 3.5,
  best: 3.2,
  good: 1.9,
  amazing: 3.4,
  helpful: 2.3,
  clean: 1.8,
  perfect: 3.5,
  awesome: 3.3,
  wonderful: 3.0,
  nice: 1.8,
  glad: 2.1,
  thanks: 1.5,
  thank: 1.5,
  upgrade: 1.5,
  renew: 1.2,
  renewal: 1.2,
  pleased: 2.3,
  satisfied: 2.5,
  resolve: 1.5,
  solved: 2.0,
  yes: 1.0,
  agree: 1.5,
  interested: 1.8,
  buying: 1.5,

  // Negative words
  bad: -2.5,
  disappointed: -2.7,
  disappoint: -2.3,
  disappointing: -2.5,
  terrible: -3.2,
  horrible: -3.0,
  hate: -3.0,
  worst: -3.1,
  error: -1.7,
  bug: -1.8,
  fail: -2.0,
  failed: -2.3,
  failure: -2.3,
  broken: -2.5,
  refund: -2.0,
  cancel: -2.2,
  cancellation: -2.2,
  lock: -1.5,
  locked: -2.0,
  angry: -2.8,
  frustrating: -2.6,
  frustrated: -2.4,
  frustration: -2.4,
  chargeback: -3.5,
  reverse: -1.5,
  unacceptable: -2.8,
  stressful: -2.2,
  waiting: -1.0,
  slow: -1.8,
  useless: -2.8,
  poor: -2.0,
  shame: -1.8,
  no: -1.2,
  unable: -1.5,
  cannot: -1.0,
  cant: -1.0,
  wont: -1.0,
  stop: -1.5,
  difficult: -1.5,
  hard: -1.0,
  issue: -1.1,
  problem: -1.2,
  problems: -1.2,
  annoying: -2.2,
  annoyed: -2.0
};

// Intensifiers/Modifiers (e.g. "very", "extremely", "not")
const INTENSIFIERS: Record<string, number> = {
  very: 1.5,
  extremely: 2.0,
  really: 1.5,
  super: 1.8,
  highly: 1.6,
  quite: 1.2,
  somewhat: 0.8,
  slightly: 0.5,
  barely: 0.3
};

const NEGATIONS = new Set([
  "not",
  "no",
  "never",
  "neither",
  "nor",
  "dont",
  "cannot",
  "cant",
  "wont",
  "didnt",
  "wasnt",
  "werent",
  "havent",
  "hasnt"
]);

export function analyzeSentimentVader(text: string): number {
  if (!text || text.trim() === "") {
    return 0.5; // neutral
  }

  // Tokenize and clean punctuation
  const tokens = text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
    .split(/\s+/);

  let totalScore = 0;
  let matches = 0;

  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i];
    if (VADER_LEXICON.hasOwnProperty(word)) {
      let wordScore = VADER_LEXICON[word];

      // Check context (negation and intensifiers in previous words)
      let multiplier = 1.0;
      let negated = false;

      // Check immediate preceding word
      if (i > 0) {
        const prevWord = tokens[i - 1];
        if (NEGATIONS.has(prevWord)) {
          negated = true;
        } else if (INTENSIFIERS.hasOwnProperty(prevWord)) {
          multiplier = INTENSIFIERS[prevWord];
        }

        // Check two words back
        if (i > 1 && !negated) {
          const prevTwoWord = tokens[i - 2];
          if (NEGATIONS.has(prevTwoWord)) {
            negated = true;
          }
        }
      }

      if (negated) {
        wordScore = -wordScore * 0.5; // Negation flips sentiment, but dampens it slightly
      } else {
        wordScore = wordScore * multiplier;
      }

      totalScore += wordScore;
      matches++;
    }
  }

  // If no words match the lexicon, return a neutral score
  if (matches === 0) {
    if (text.includes("!")) {
      return 0.6;
    }
    return 0.5;
  }

  // Normalize score to 0.0 - 1.0 scale
  const alpha = 15;
  const compound = totalScore / Math.sqrt(totalScore * totalScore + alpha);
  const normalized = (compound + 1.0) / 2.0;

  return Math.max(0.0, Math.min(1.0, Number(normalized.toFixed(2))));
}
