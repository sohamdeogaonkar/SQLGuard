// In-memory attack log store (client-side via localStorage)

const STORAGE_KEY = 'sqlguard_logs';
const MAX_LOGS = 200;

export function getLogs() {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addLog(result) {
  if (typeof window === 'undefined') return;
  const logs = getLogs();
  logs.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    ...result,
  });
  if (logs.length > MAX_LOGS) logs.length = MAX_LOGS;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  return logs;
}

export function clearLogs() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getStats() {
  const logs = getLogs();
  const total = logs.length;
  const blocked = logs.filter(l => l.isMalicious).length;
  const safe = total - blocked;

  const bySeverity = {
    safe: logs.filter(l => l.riskScore <= 15).length,
    low: logs.filter(l => l.riskScore > 15 && l.riskScore <= 35).length,
    medium: logs.filter(l => l.riskScore > 35 && l.riskScore <= 60).length,
    high: logs.filter(l => l.riskScore > 60 && l.riskScore <= 80).length,
    critical: logs.filter(l => l.riskScore > 80).length,
  };

  const topPatterns = {};
  for (const log of logs) {
    for (const m of (log.matches || [])) {
      topPatterns[m.name] = (topPatterns[m.name] || 0) + 1;
    }
  }

  return { total, blocked, safe, bySeverity, topPatterns };
}
