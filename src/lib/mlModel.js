// SQLGuard Machine Learning Inference Engine
// Edge-compatible, pure JS inference using trained Logistic Regression weights
import weightsData from './mlWeights.js';

function calculateEntropy(str) {
  if (!str || str.length === 0) return 0;
  const freqs = {};
  for (const c of str) {
    freqs[c] = (freqs[c] || 0) + 1;
  }
  let entropy = 0;
  const len = str.length;
  for (const c in freqs) {
    const p = freqs[c] / len;
    entropy -= p * Math.log2(p);
  }
  return +entropy.toFixed(4);
}

export function predictSQLiML(input) {
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

  if (!input || typeof input !== 'string' || input.trim() === '') {
    return {
      isMalicious: false,
      probability: 0.1,
      probabilityRaw: 0.001,
      confidence: 'HIGH',
      modelName: 'Logistic Regression (Feature Vector + TF-IDF)',
      inferenceTimeMs: 0.1,
      topContributors: [],
    };
  }

  const text = input;
  const tUpper = text.toUpperCase();
  const length = Math.max(text.length, 1);

  // 1. Extract 11 Domain Features
  const ent = calculateEntropy(text);
  const singleQuotes = (text.match(/'/g) || []).length;
  const doubleQuotes = (text.match(/"/g) || []).length;
  const semicolons = (text.match(/;/g) || []).length;
  const comments = (text.match(/(--|\/\*|\*\/|#)/g) || []).length;
  const equals = (text.match(/=/g) || []).length;
  const parens = (text.match(/[()]/g) || []).length;

  let kwCount = 0;
  for (const kw of weightsData.sqlKeywords) {
    const regex = new RegExp(`\\b${kw}\\b`, 'g');
    const m = tUpper.match(regex);
    if (m) kwCount += m.length;
  }

  const punctCount = (text.match(/[^a-zA-Z0-9\s]/g) || []).length;
  const punctRatio = punctCount / length;

  const hasTautology = /(\b(OR|AND)\b\s+['"0-9a-zA-Z]+\s*=\s*['"0-9a-zA-Z]+|\b\d+\s*=\s*\d+\b)/.test(tUpper)
    ? 1.0
    : 0.0;
  const logLen = Math.log(length + 1);

  const rawDense = [
    ent,
    singleQuotes,
    doubleQuotes,
    semicolons,
    comments,
    equals,
    parens,
    kwCount,
    punctRatio,
    hasTautology,
    logLen,
  ];

  // 2. Standardize Dense Features (mean, std)
  const denseContributions = [];
  let logit = weightsData.intercept;

  const { names, means, stds, weights: denseWeights } = weightsData.denseFeatures;
  for (let i = 0; i < rawDense.length; i++) {
    const stdVal = stds[i] === 0 ? 1.0 : stds[i];
    const scaled = (rawDense[i] - means[i]) / stdVal;
    const contribution = scaled * denseWeights[i];
    logit += contribution;

    if (Math.abs(contribution) > 0.15) {
      denseContributions.push({
        feature: names[i].replace('_', ' '),
        rawVal: rawDense[i],
        contribution: +contribution.toFixed(2),
        direction: contribution > 0 ? 'MALICIOUS' : 'BENIGN',
      });
    }
  }

  // 3. Extract N-Gram TF-IDF features
  const lowerText = text.toLowerCase();
  const { vocab, idf, weights: ngramWeights } = weightsData.ngrams;

  // Compute term frequencies for character 3-grams and 4-grams in vocab
  const tf = new Float64Array(vocab.length);
  let tfSumSquares = 0;

  for (let i = 0; i < vocab.length; i++) {
    const gram = vocab[i];
    let count = 0;
    let pos = 0;
    while ((pos = lowerText.indexOf(gram, pos)) !== -1) {
      count++;
      pos++;
    }
    if (count > 0) {
      const val = count * idf[i];
      tf[i] = val;
      tfSumSquares += val * val;
    }
  }

  // L2 Normalize TF-IDF
  const norm = Math.sqrt(tfSumSquares) || 1.0;
  for (let i = 0; i < vocab.length; i++) {
    if (tf[i] > 0) {
      const normalizedTfidf = tf[i] / norm;
      const contribution = normalizedTfidf * ngramWeights[i];
      logit += contribution;

      if (Math.abs(contribution) > 0.2) {
        denseContributions.push({
          feature: `ngram "${vocab[i]}"`,
          rawVal: 1,
          contribution: +contribution.toFixed(2),
          direction: contribution > 0 ? 'MALICIOUS' : 'BENIGN',
        });
      }
    }
  }

  // 4. Sigmoid Probability Calculation: P(SQLi) = 1 / (1 + e^-logit)
  // Clamp logit to prevent numerical overflow
  const clampedLogit = Math.max(-15, Math.min(15, logit));
  const probability = 1.0 / (1.0 + Math.exp(-clampedLogit));

  const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const inferenceMs = +(endTime - startTime).toFixed(2);

  // Sort top influential features by absolute contribution
  denseContributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  return {
    isMalicious: probability >= 0.5,
    probability: +(probability * 100).toFixed(1), // e.g. 99.4%
    probabilityRaw: +probability.toFixed(4),
    confidence: probability >= 0.85 || probability <= 0.15 ? 'HIGH' : 'MODERATE',
    logit: +clampedLogit.toFixed(2),
    inferenceTimeMs: Math.max(0.1, inferenceMs),
    modelName: 'Logistic Regression + N-Gram TF-IDF',
    topContributors: denseContributions.slice(0, 4),
  };
}
