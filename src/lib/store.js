// SQLGuard WAF Event Store & Telemetry Bus
import { detectSQLInjection, buildVulnerableQuery, buildSecureQuery } from './detector';

const STORAGE_KEY = 'sqlguard_waf_logs';
const MAX_LOGS = 250;

const SEED_REQUESTS = [
  {
    id: 'req_8f12a9',
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    targetApp: 'ApexPortal',
    targetHost: 'auth.apex-corp.internal',
    method: 'POST',
    endpoint: '/api/v1/auth/login',
    clientIp: '198.51.100.44',
    latencyMs: 1.1,
    payload: "admin' OR '1'='1' --",
    field: 'username',
    verdict: 'BLOCKED',
    httpStatus: 403,
    riskScore: 95,
    level: { label: 'Critical', color: 'red' },
    mitigationRule: 'RULE-SQLI-TAUTOLOGY',
    matches: [
      { patternId: 'tautology', name: 'Tautology Attack', severity: 9, matched: "' OR '1'='1'" },
      { patternId: 'comment_sequence', name: 'SQL Comment Injection', severity: 6, matched: '--' },
    ],
    explanation: 'Authentication bypass tautology pattern with comment truncation.',
    vulnerableSql: "SELECT * FROM users WHERE username = 'admin' OR '1'='1' --' AND password = '***'",
    secureSql: 'SELECT * FROM users WHERE username = ? AND password = ?',
    secureParams: ["admin' OR '1'='1' --", '***'],
  },
  {
    id: 'req_7a39b2',
    timestamp: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    targetApp: 'ShopSphere',
    targetHost: 'shop.sphere-retail.com',
    method: 'GET',
    endpoint: '/catalog/search?q=mechanical+keyboard',
    clientIp: '203.0.113.19',
    latencyMs: 0.8,
    payload: 'mechanical keyboard',
    field: 'q',
    verdict: 'ALLOWED',
    httpStatus: 200,
    riskScore: 0,
    level: { label: 'Safe', color: 'emerald' },
    mitigationRule: 'DEFAULT-ALLOW',
    matches: [],
    explanation: 'Benign catalog keyword query.',
    vulnerableSql: "SELECT * FROM products WHERE name LIKE '%mechanical keyboard%'",
    secureSql: 'SELECT * FROM products WHERE name LIKE ?',
    secureParams: ['%mechanical keyboard%'],
  },
  {
    id: 'req_6c48d1',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    targetApp: 'MedVault',
    targetHost: 'records.medvault-health.org',
    method: 'GET',
    endpoint: '/api/records/mrn?id=0+UNION+SELECT+1,sqlite_version(),3,4,5--',
    clientIp: '192.0.2.89',
    latencyMs: 1.4,
    payload: '0 UNION SELECT 1,sqlite_version(),3,4,5--',
    field: 'id',
    verdict: 'BLOCKED',
    httpStatus: 403,
    riskScore: 100,
    level: { label: 'Critical', color: 'red' },
    mitigationRule: 'RULE-SQLI-UNION',
    matches: [
      { patternId: 'union_select', name: 'UNION SELECT', severity: 10, matched: 'UNION SELECT' },
      { patternId: 'comment_sequence', name: 'SQL Comment Injection', severity: 6, matched: '--' },
    ],
    explanation: 'Database fingerprinting attempt using UNION SELECT injection.',
    vulnerableSql: 'SELECT id, patient_name, mrn, diagnosis, physician FROM records WHERE id = 0 UNION SELECT 1,sqlite_version(),3,4,5--',
    secureSql: 'SELECT id, patient_name, mrn, diagnosis, physician FROM records WHERE id = ?',
    secureParams: [0],
  },
  {
    id: 'req_5e21f4',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    targetApp: 'ApexPortal',
    targetHost: 'auth.apex-corp.internal',
    method: 'POST',
    endpoint: '/api/v1/auth/login',
    clientIp: '198.51.100.12',
    latencyMs: 0.9,
    payload: 'sarah.jenkins@apexcorp.com',
    field: 'username',
    verdict: 'ALLOWED',
    httpStatus: 200,
    riskScore: 0,
    level: { label: 'Safe', color: 'emerald' },
    mitigationRule: 'DEFAULT-ALLOW',
    matches: [],
    explanation: 'Standard user authentication payload.',
    vulnerableSql: "SELECT * FROM users WHERE username = 'sarah.jenkins@apexcorp.com' AND password = '***'",
    secureSql: 'SELECT * FROM users WHERE username = ? AND password = ?',
    secureParams: ['sarah.jenkins@apexcorp.com', '***'],
  },
  {
    id: 'req_4d99e0',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    targetApp: 'ShopSphere',
    targetHost: 'shop.sphere-retail.com',
    method: 'GET',
    endpoint: '/catalog/search?q=%27;+DROP+TABLE+products;+--',
    clientIp: '185.220.101.5',
    latencyMs: 1.3,
    payload: "'; DROP TABLE products; --",
    field: 'q',
    verdict: 'BLOCKED',
    httpStatus: 403,
    riskScore: 100,
    level: { label: 'Critical', color: 'red' },
    mitigationRule: 'RULE-SQLI-STACKED',
    matches: [
      { patternId: 'stacked_query', name: 'Stacked Query', severity: 10, matched: '; DROP' },
      { patternId: 'comment_sequence', name: 'SQL Comment Injection', severity: 6, matched: '--' },
    ],
    explanation: 'Destructive stacked query command detected.',
    vulnerableSql: "SELECT * FROM products WHERE name LIKE '%'; DROP TABLE products; --%'",
    secureSql: 'SELECT * FROM products WHERE name LIKE ?',
    secureParams: ["%'; DROP TABLE products; --%"],
  },
];

export function getLogs() {
  if (typeof window === 'undefined') return SEED_REQUESTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_REQUESTS));
      return SEED_REQUESTS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_REQUESTS;
  }
}

export function recordInspection({
  targetApp,
  targetHost = 'app.internal',
  method = 'POST',
  endpoint,
  clientIp = '127.0.0.1',
  field = 'input',
  payload,
}) {
  const detection = detectSQLInjection(payload || '');
  const isBlocked = detection.isMalicious;

  let mitigationRule = 'DEFAULT-ALLOW';
  if (detection.matches.length > 0) {
    const top = detection.matches[0];
    mitigationRule = `RULE-SQLI-${top.patternId.toUpperCase()}`;
  }

  // Construct queries for inspector view
  let vulnerableSql = '';
  let secureSql = '';
  let secureParams = [];

  if (targetApp === 'ApexPortal') {
    vulnerableSql = buildVulnerableQuery('login', { username: payload, password: '***' });
    const sec = buildSecureQuery('login', { username: payload, password: '***' });
    secureSql = sec.query;
    secureParams = sec.params;
  } else if (targetApp === 'ShopSphere') {
    vulnerableSql = buildVulnerableQuery('search', { query: payload });
    const sec = buildSecureQuery('search', { query: payload });
    secureSql = sec.query;
    secureParams = sec.params;
  } else {
    vulnerableSql = buildVulnerableQuery('union', { id: payload });
    const sec = buildSecureQuery('union', { id: payload });
    secureSql = sec.query;
    secureParams = sec.params;
  }

  const logEntry = {
    id: 'req_' + Math.random().toString(36).substring(2, 8),
    timestamp: new Date().toISOString(),
    targetApp,
    targetHost,
    method,
    endpoint,
    clientIp,
    latencyMs: +(Math.random() * 0.8 + 0.6).toFixed(1),
    payload: String(payload || ''),
    field,
    verdict: isBlocked ? 'BLOCKED' : 'ALLOWED',
    httpStatus: isBlocked ? 403 : 200,
    riskScore: detection.riskScore,
    level: detection.level,
    mitigationRule,
    matches: detection.matches,
    explanation: detection.explanation,
    vulnerableSql,
    secureSql,
    secureParams,
  };

  if (typeof window !== 'undefined') {
    const current = getLogs();
    const updated = [logEntry, ...current].slice(0, MAX_LOGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('sqlguard-log-created', { detail: logEntry }));
  }

  return logEntry;
}

export function addLog(result) {
  return recordInspection({
    targetApp: 'ApexPortal',
    endpoint: '/api/v1/auth/login',
    payload: result?.input || '',
  });
}

export function clearLogs() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  window.dispatchEvent(new CustomEvent('sqlguard-log-cleared'));
}

export function getStats() {
  const logs = getLogs();
  const total = logs.length;
  const blocked = logs.filter(l => l.verdict === 'BLOCKED').length;
  const allowed = total - blocked;
  const blockRate = total > 0 ? Math.round((blocked / total) * 100) : 0;

  const byApp = {
    ApexPortal: logs.filter(l => l.targetApp === 'ApexPortal').length,
    ShopSphere: logs.filter(l => l.targetApp === 'ShopSphere').length,
    MedVault: logs.filter(l => l.targetApp === 'MedVault').length,
  };

  const bySeverity = {
    safe: logs.filter(l => l.riskScore <= 15).length,
    low: logs.filter(l => l.riskScore > 15 && l.riskScore <= 35).length,
    medium: logs.filter(l => l.riskScore > 35 && l.riskScore <= 60).length,
    high: logs.filter(l => l.riskScore > 60 && l.riskScore <= 80).length,
    critical: logs.filter(l => l.riskScore > 80).length,
  };

  return { total, blocked, allowed, blockRate, byApp, bySeverity };
}
