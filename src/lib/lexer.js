// SQLGuard Lexical Tokenizer & Information Entropy Analyzer
// Research module: Grammar-based SQLi token stream decomposition

export function calculateShannonEntropy(str) {
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
  return +entropy.toFixed(3);
}

export function tokenizeSQLStream(input) {
  if (!input || typeof input !== 'string') return [];

  const tokens = [];
  const tokenRegex =
    /(--[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*)|(\b(?:OR|AND|UNION|SELECT|FROM|WHERE|DROP|DELETE|INSERT|UPDATE|ORDER\s+BY|SLEEP|BENCHMARK|CHAR|CHR|CONCAT|LOAD_FILE|HEX|ASCII|SUBSTRING)\b)|('[^']*'|\"[^\"]*\")|(\b\d+(?:\.\d+)?(?:e\d+)?\b)|([=<>!]+|[;(),+*\/&|^])|([a-zA-Z_][a-zA-Z0-9_.]*)/gi;

  let m;
  while ((m = tokenRegex.exec(input)) !== null) {
    if (m[1]) {
      tokens.push({ type: 'SQL_COMMENT', value: m[1], raw: m[0], risk: 'HIGH' });
    } else if (m[2]) {
      tokens.push({ type: 'SQL_KEYWORD', value: m[2].toUpperCase(), raw: m[0], risk: 'HIGH' });
    } else if (m[3]) {
      tokens.push({ type: 'STRING_LITERAL', value: m[3], raw: m[0], risk: 'NEUTRAL' });
    } else if (m[4]) {
      tokens.push({ type: 'NUMERIC_LITERAL', value: m[4], raw: m[0], risk: 'NEUTRAL' });
    } else if (m[5]) {
      tokens.push({ type: 'OPERATOR_PUNCT', value: m[5], raw: m[0], risk: m[5] === ';' ? 'CRITICAL' : 'NEUTRAL' });
    } else if (m[6]) {
      tokens.push({ type: 'IDENTIFIER', value: m[6], raw: m[0], risk: 'NEUTRAL' });
    }
  }

  return tokens;
}

export function analyzeASTMutation(input) {
  const entropy = calculateShannonEntropy(input);
  const tokens = tokenizeSQLStream(input);

  // Check for grammar state transition (e.g. from literal context to logical operator)
  const hasComment = tokens.some((t) => t.type === 'SQL_COMMENT');
  const hasLogicalOp = tokens.some((t) => t.type === 'SQL_KEYWORD' && ['OR', 'AND'].includes(t.value));
  const hasUnion = tokens.some((t) => t.type === 'SQL_KEYWORD' && t.value === 'UNION');
  const hasStacked = tokens.some((t) => t.value === ';');

  let astShift = 'NONE (IMMUTABLE PARAMETER)';
  let grammarVerdict = 'CLEAN';

  if (hasUnion) {
    astShift = 'CLAUSE_APPEND: Statement extended with secondary SELECT clause';
    grammarVerdict = 'CRITICAL_SYNTAX_MUTATION';
  } else if (hasStacked) {
    astShift = 'QUERY_SPLIT: Semicolon induces multi-statement execution branch';
    grammarVerdict = 'CRITICAL_SYNTAX_MUTATION';
  } else if (hasLogicalOp && (hasComment || tokens.length >= 4)) {
    astShift = 'BOOLEAN_EXPANSION: WHERE predicate altered via disjunction tautology';
    grammarVerdict = 'HIGH_SYNTAX_MUTATION';
  } else if (hasComment) {
    astShift = 'TAIL_TRUNCATION: Subsequent SQL tokens masked from optimizer';
    grammarVerdict = 'SUSPICIOUS_TRUNCATION';
  }

  return {
    entropy,
    entropyVerdict: entropy > 4.2 ? 'HIGH_ANOMALY (Obfuscated/Encoded)' : entropy > 3.0 ? 'ELEVATED' : 'NORMAL (Natural Text)',
    tokenCount: tokens.length,
    tokens,
    astShift,
    grammarVerdict,
  };
}
