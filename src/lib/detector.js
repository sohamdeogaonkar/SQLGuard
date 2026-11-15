import { SQL_PATTERNS, RISK_LEVELS } from './patterns';

export function detectSQLInjection(input) {
  if (!input || input.trim() === '') {
    return {
      input,
      riskScore: 0,
      level: RISK_LEVELS.SAFE,
      matches: [],
      isMalicious: false,
      explanation: 'Empty input — nothing to analyze.',
      timestamp: new Date().toISOString(),
    };
  }

  const matches = [];
  let totalSeverity = 0;

  for (const pattern of SQL_PATTERNS) {
    const found = input.match(pattern.regex);
    if (found) {
      matches.push({
        patternId: pattern.id,
        name: pattern.name,
        severity: pattern.severity,
        description: pattern.description,
        matched: found[0],
        count: found.length,
      });
      totalSeverity += pattern.severity * found.length;
    }
  }

  // Normalize risk score to 0-100
  const riskScore = Math.min(100, Math.round((totalSeverity / 20) * 100));

  // Determine risk level
  let level = RISK_LEVELS.SAFE;
  for (const [, rl] of Object.entries(RISK_LEVELS)) {
    if (riskScore >= rl.min && riskScore <= rl.max) {
      level = rl;
      break;
    }
  }

  // Generate explanation
  let explanation = '';
  if (matches.length === 0) {
    explanation = 'No SQL injection patterns detected. The input appears safe.';
  } else {
    const topMatch = matches.sort((a, b) => b.severity - a.severity)[0];
    explanation = `Detected ${matches.length} suspicious pattern${matches.length > 1 ? 's' : ''}. `;
    explanation += `Most severe: ${topMatch.name} — ${topMatch.description}. `;
    if (riskScore > 60) {
      explanation += 'This input would likely be used in an SQL injection attack and should be blocked.';
    } else if (riskScore > 30) {
      explanation += 'This input contains patterns commonly associated with SQL injection probing.';
    } else {
      explanation += 'Low-confidence match — could be a false positive but warrants logging.';
    }
  }

  return {
    input,
    riskScore,
    level,
    matches: matches.sort((a, b) => b.severity - a.severity),
    isMalicious: riskScore > 35,
    explanation,
    timestamp: new Date().toISOString(),
  };
}

export function buildVulnerableQuery(type, input) {
  switch (type) {
    case 'login':
      return `SELECT * FROM users WHERE username = '${input.username}' AND password = '${input.password}'`;
    case 'search':
      return `SELECT * FROM products WHERE name LIKE '%${input.query}%'`;
    case 'union':
      return `SELECT id, name, price FROM products WHERE id = ${input.id}`;
    default:
      return `SELECT * FROM data WHERE value = '${input}'`;
  }
}

export function buildSecureQuery(type, input) {
  switch (type) {
    case 'login':
      return {
        query: 'SELECT * FROM users WHERE username = ? AND password = ?',
        params: [input.username, input.password],
      };
    case 'search':
      return {
        query: 'SELECT * FROM products WHERE name LIKE ?',
        params: [`%${input.query}%`],
      };
    case 'union':
      return {
        query: 'SELECT id, name, price FROM products WHERE id = ?',
        params: [input.id],
      };
    default:
      return {
        query: 'SELECT * FROM data WHERE value = ?',
        params: [input],
      };
  }
}
