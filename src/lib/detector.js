import { SQL_PATTERNS, RISK_LEVELS } from './patterns.js';

export function detectSQLInjection(input) {
  if (!input || typeof input !== 'string' || input.trim() === '') {
    return {
      input: input || '',
      riskScore: 0,
      level: RISK_LEVELS.SAFE,
      matches: [],
      isMalicious: false,
      explanation: 'Empty parameter payload.',
      timestamp: new Date().toISOString(),
    };
  }

  const matches = [];
  let totalSeverity = 0;
  let maxSeverity = 0;

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
      if (pattern.severity > maxSeverity) {
        maxSeverity = pattern.severity;
      }
    }
  }

  // Any pattern with severity >= 7 is definitively malicious and must be blocked
  const isMalicious = matches.length > 0 && (maxSeverity >= 7 || totalSeverity >= 7);

  // Compute normalized risk score (0-100)
  let riskScore = 0;
  if (matches.length > 0) {
    if (maxSeverity >= 10 || totalSeverity >= 16) {
      riskScore = 100;
    } else if (maxSeverity >= 9 || totalSeverity >= 12) {
      riskScore = 95;
    } else if (maxSeverity >= 8 || totalSeverity >= 9) {
      riskScore = 85;
    } else if (maxSeverity >= 7) {
      riskScore = 75;
    } else {
      riskScore = Math.min(60, Math.round((totalSeverity / 10) * 60));
    }
  }

  // Determine risk tier
  let level = RISK_LEVELS.SAFE;
  for (const [, rl] of Object.entries(RISK_LEVELS)) {
    if (riskScore >= rl.min && riskScore <= rl.max) {
      level = rl;
      break;
    }
  }

  // Concise technical explanation
  let explanation = '';
  if (matches.length === 0) {
    explanation = 'No SQL injection signatures identified. Input parameter verified clean.';
  } else {
    const topMatch = matches.sort((a, b) => b.severity - a.severity)[0];
    explanation = `Identified signature: ${topMatch.name} (Matched: \`${topMatch.matched}\`). `;
    if (isMalicious) {
      explanation += 'Request violates WAF injection policy and was dropped at edge.';
    } else {
      explanation += 'Low risk anomaly logged for security telemetry.';
    }
  }

  return {
    input,
    riskScore,
    level,
    matches: matches.sort((a, b) => b.severity - a.severity),
    isMalicious,
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
      return `SELECT id, patient_name, mrn, diagnosis, physician FROM patient_records WHERE id = ${input.id}`;
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
        query: 'SELECT id, patient_name, mrn, diagnosis, physician FROM patient_records WHERE id = ?',
        params: [parseInt(input.id) || 0],
      };
    default:
      return {
        query: 'SELECT * FROM data WHERE value = ?',
        params: [input],
      };
  }
}
