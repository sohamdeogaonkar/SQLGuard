'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
  ExternalLink,
  Search,
  Trash2,
  RefreshCw,
  Zap,
  ArrowUpRight,
  Layers,
  Terminal,
  BookOpen,
  Code2,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import RequestInspector from '../components/RequestInspector';
import CodeBlock from '../components/CodeBlock';
import RiskBadge from '../components/RiskBadge';
import { getLogs, getStats, clearLogs, recordInspection } from '../lib/store';
import { SQL_PATTERNS } from '../lib/patterns';
import { buildVulnerableQuery, buildSecureQuery } from '../lib/detector';

const TARGET_APPS = [
  {
    name: 'ApexPortal',
    type: 'Corporate IAM / SSO',
    host: 'auth.apex-corp.internal',
    endpoint: 'POST /api/v1/auth/login',
    href: '/demos/login',
    color: 'border-blue-500/30 text-blue-400 bg-blue-500/5',
    dot: 'bg-blue-400',
    description: 'Enterprise employee authentication gateway.',
  },
  {
    name: 'ShopSphere',
    type: 'Consumer E-Commerce',
    host: 'shop.sphere-retail.com',
    endpoint: 'GET /catalog/search?q=',
    href: '/demos/search',
    color: 'border-amber-500/30 text-amber-400 bg-amber-500/5',
    dot: 'bg-amber-400',
    description: 'Public retail storefront product catalog.',
  },
  {
    name: 'MedVault',
    type: 'Clinical Healthcare EHR',
    host: 'records.medvault-health.org',
    endpoint: 'GET /api/records/mrn?id=',
    href: '/demos/union',
    color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5',
    dot: 'bg-emerald-400',
    description: 'HIPAA-regulated internal patient database.',
  },
];

const QUICK_PAYLOADS = [
  { label: 'Normal Login', app: 'ApexPortal', payload: 'sarah.jenkins@apexcorp.com' },
  { label: 'Tautology Bypass', app: 'ApexPortal', payload: "' OR '1'='1' --" },
  { label: 'Admin Cutoff', app: 'ApexPortal', payload: "admin'--" },
  { label: 'Clean Search', app: 'ShopSphere', payload: 'wireless headphones' },
  { label: 'UNION Exfiltration', app: 'ShopSphere', payload: "' UNION SELECT username, password FROM users --" },
  { label: 'Destructive Stacked', app: 'ShopSphere', payload: "'; DROP TABLE products; --" },
  { label: 'Normal Patient #101', app: 'MedVault', payload: '101' },
  { label: 'DB Fingerprint', app: 'MedVault', payload: '0 UNION SELECT 1, sqlite_version(), 3, 4, 5 --' },
];

export default function SidebarDashboard() {
  const [activeTab, setActiveTab] = useState('traffic'); // 'traffic' | 'rules' | 'dispatcher' | 'mitigation'
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, blocked: 0, allowed: 0, blockRate: 0, byApp: {} });
  const [activeAppFilter, setActiveAppFilter] = useState('ALL');
  const [activeVerdictFilter, setActiveVerdictFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  // Dispatcher state
  const [dispApp, setDispApp] = useState('ApexPortal');
  const [dispPayload, setDispPayload] = useState("' OR '1'='1' --");
  const [dispResult, setDispResult] = useState(null);

  // Mitigation state
  const [mitApp, setMitApp] = useState('ApexPortal');

  const refreshData = () => {
    setLogs(getLogs());
    setStats(getStats());
  };

  useEffect(() => {
    refreshData();

    const handleNewLog = () => refreshData();
    const handleStorage = (e) => {
      if (e.key === 'sqlguard_waf_logs') refreshData();
    };

    window.addEventListener('sqlguard-log-created', handleNewLog);
    window.addEventListener('sqlguard-log-cleared', handleNewLog);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('sqlguard-log-created', handleNewLog);
      window.removeEventListener('sqlguard-log-cleared', handleNewLog);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleDispatch = (e) => {
    e?.preventDefault();
    if (!dispPayload.trim()) return;

    let endpoint = '/api/v1/auth/login';
    let field = 'username';
    if (dispApp === 'ShopSphere') {
      endpoint = `/catalog/search?q=${encodeURIComponent(dispPayload)}`;
      field = 'q';
    } else if (dispApp === 'MedVault') {
      endpoint = `/api/records/mrn?id=${encodeURIComponent(dispPayload)}`;
      field = 'id';
    }

    const created = recordInspection({
      targetApp: dispApp,
      targetHost: dispApp === 'ApexPortal' ? 'auth.apex-corp.internal' : dispApp === 'ShopSphere' ? 'shop.sphere-retail.com' : 'records.medvault-health.org',
      method: dispApp === 'ApexPortal' ? 'POST' : 'GET',
      endpoint,
      clientIp: '127.0.0.1',
      field,
      payload: dispPayload,
    });

    refreshData();
    setDispResult(created);
  };

  const filteredLogs = logs.filter(log => {
    if (activeAppFilter !== 'ALL' && log.targetApp !== activeAppFilter) return false;
    if (activeVerdictFilter === 'BLOCKED' && log.verdict !== 'BLOCKED') return false;
    if (activeVerdictFilter === 'ALLOWED' && log.verdict !== 'ALLOWED') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        log.payload?.toLowerCase().includes(q) ||
        log.clientIp?.toLowerCase().includes(q) ||
        log.endpoint?.toLowerCase().includes(q) ||
        log.targetApp?.toLowerCase().includes(q) ||
        log.mitigationRule?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500/20 selection:text-amber-300">
      {/* Sidebar Component */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Control Bar */}
        <header className="h-14 border-b border-zinc-800 bg-zinc-950/80 sticky top-0 z-20 backdrop-blur-md px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider">Console /</span>
            <span className="text-xs font-semibold text-zinc-200 uppercase font-mono">
              {activeTab === 'traffic' && 'Traffic Analyzer & Live Stream'}
              {activeTab === 'rules' && 'WAF Signature Rules'}
              {activeTab === 'dispatcher' && 'Payload Dispatcher & Sandbox'}
              {activeTab === 'mitigation' && 'Query Mitigation Specs'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick KPI stats in topbar */}
            <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono border-r border-zinc-800 pr-4">
              <span className="text-zinc-500">Captured: <strong className="text-zinc-200">{stats.total}</strong></span>
              <span className="text-zinc-500">Blocked: <strong className="text-red-400">{stats.blocked}</strong></span>
              <span className="text-zinc-500">Allowed: <strong className="text-emerald-400">{stats.allowed}</strong></span>
              <span className="text-zinc-500">Drop Rate: <strong className="text-amber-400">{stats.blockRate}%</strong></span>
            </div>

            <button
              onClick={refreshData}
              className="flex items-center gap-1 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 transition-colors"
            >
              <RefreshCw className="h-3 w-3 text-zinc-400" />
              Sync
            </button>
            <button
              onClick={() => { clearLogs(); refreshData(); }}
              className="flex items-center gap-1 rounded bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 px-2.5 py-1 text-xs text-red-400 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="p-6 flex-1 space-y-6">
          {/* TAB 1: TRAFFIC ANALYZER */}
          {activeTab === 'traffic' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Target Apps Cards */}
              <div className="grid gap-3 md:grid-cols-3">
                {TARGET_APPS.map((app) => {
                  const count = logs.filter(l => l.targetApp === app.name).length;
                  const blocked = logs.filter(l => l.targetApp === app.name && l.verdict === 'BLOCKED').length;

                  return (
                    <div
                      key={app.name}
                      className="group flex flex-col justify-between rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 hover:border-zinc-700 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-mono font-medium ${app.color}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${app.dot}`} />
                            {app.type}
                          </span>
                          <span className="font-mono text-xs text-red-400 font-semibold">{blocked} blocked</span>
                        </div>

                        <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white">{app.name}</h3>
                        <p className="font-mono text-xs text-zinc-500 mt-0.5">{app.endpoint}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-zinc-500">{count} requests logged</span>
                        <Link
                          href={app.href}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-200 transition-colors"
                        >
                          Launch App <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Filter Controls & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex rounded-md border border-zinc-800 bg-zinc-900 p-0.5 text-xs font-mono">
                    {['ALL', 'ApexPortal', 'ShopSphere', 'MedVault'].map((app) => (
                      <button
                        key={app}
                        onClick={() => setActiveAppFilter(app)}
                        className={`rounded px-2.5 py-1 transition-colors ${
                          activeAppFilter === app ? 'bg-zinc-800 text-zinc-100 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {app}
                      </button>
                    ))}
                  </div>

                  <div className="flex rounded-md border border-zinc-800 bg-zinc-900 p-0.5 text-xs font-mono">
                    {['ALL', 'BLOCKED', 'ALLOWED'].map((v) => (
                      <button
                        key={v}
                        onClick={() => setActiveVerdictFilter(v)}
                        className={`rounded px-2.5 py-1 transition-colors ${
                          activeVerdictFilter === v ? 'bg-zinc-800 text-zinc-100 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search IP, payload, rule..."
                    className="w-full rounded-md border border-zinc-800 bg-zinc-900/80 pl-8 pr-3 py-1.5 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Live Request Table */}
              <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/40">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="border-b border-zinc-800 bg-zinc-900/90 text-zinc-400 uppercase text-[10px]">
                    <tr>
                      <th className="px-3.5 py-2.5">Time</th>
                      <th className="px-3.5 py-2.5">Target App</th>
                      <th className="px-3.5 py-2.5">Endpoint</th>
                      <th className="px-3.5 py-2.5">Client IP</th>
                      <th className="px-3.5 py-2.5">Payload</th>
                      <th className="px-3.5 py-2.5">Triggered Rule</th>
                      <th className="px-3.5 py-2.5">Verdict</th>
                      <th className="px-3.5 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-zinc-500 font-mono">
                          No requests match filter criteria. Submit a request in one of the standalone target apps.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => {
                        const isBlocked = log.verdict === 'BLOCKED';
                        return (
                          <tr
                            key={log.id}
                            onClick={() => setSelectedLog(log)}
                            className="cursor-pointer hover:bg-zinc-800/40 transition-colors"
                          >
                            <td className="px-3.5 py-2.5 text-zinc-400 whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="px-3.5 py-2.5 whitespace-nowrap">
                              <span className="font-semibold text-zinc-200">{log.targetApp}</span>
                            </td>
                            <td className="px-3.5 py-2.5 text-zinc-300 max-w-[160px] truncate">
                              {log.endpoint}
                            </td>
                            <td className="px-3.5 py-2.5 text-zinc-400 whitespace-nowrap">
                              {log.clientIp}
                            </td>
                            <td className="px-3.5 py-2.5 text-amber-300 max-w-[220px] truncate">
                              {log.payload}
                            </td>
                            <td className="px-3.5 py-2.5 text-zinc-400 whitespace-nowrap">
                              {log.mitigationRule}
                            </td>
                            <td className="px-3.5 py-2.5 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold ${
                                  isBlocked
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                }`}
                              >
                                {log.httpStatus} {log.verdict}
                              </span>
                            </td>
                            <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLog(log);
                                }}
                                className="rounded bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 text-[11px] text-zinc-300 transition-colors"
                              >
                                Inspect
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: WAF SIGNATURE RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-mono font-semibold uppercase text-zinc-200">Active WAF Signatures ({SQL_PATTERNS.length})</h2>
                <span className="text-[11px] font-mono text-emerald-400">DETERMINISTIC EVALUATION</span>
              </div>

              <div className="grid gap-3">
                {SQL_PATTERNS.map((p) => {
                  const matchCount = logs.reduce((acc, l) => {
                    return acc + (l.matches?.filter(m => m.patternId === p.id).length || 0);
                  }, 0);

                  return (
                    <div
                      key={p.id}
                      className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 space-y-2 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-zinc-200">{p.name}</span>
                          <span className="font-mono text-[10px] text-zinc-500">ID: RULE-SQLI-{p.id.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-amber-400">{matchCount} hits</span>
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold ${
                            p.severity >= 9 ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            p.severity >= 7 ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}>
                            Severity: {p.severity}/10
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-400">{p.description}</p>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-zinc-800/80 font-mono text-xs">
                        <div className="text-zinc-500 truncate max-w-md">
                          Pattern: <code className="text-zinc-300 bg-zinc-950 px-1.5 py-0.5 rounded">{String(p.regex)}</code>
                        </div>
                        <div className="text-zinc-500">
                          Sample Vector: <code className="text-amber-400 bg-zinc-950 px-1.5 py-0.5 rounded">{p.example}</code>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PAYLOAD DISPATCHER */}
          {activeTab === 'dispatcher' && (
            <div className="space-y-6 max-w-3xl animate-in fade-in duration-150">
              <h2 className="text-sm font-mono font-semibold uppercase text-zinc-200">In-Line Payload Dispatcher</h2>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-zinc-500 uppercase">Quick Test Payloads:</span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PAYLOADS.map((q) => (
                    <button
                      key={q.label}
                      onClick={() => {
                        setDispApp(q.app);
                        setDispPayload(q.payload);
                      }}
                      className="rounded border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 px-2 py-1 text-xs font-mono text-zinc-300 transition-colors"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleDispatch} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1">Target Application Host</label>
                    <select
                      value={dispApp}
                      onChange={(e) => setDispApp(e.target.value)}
                      className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none"
                    >
                      <option value="ApexPortal">ApexPortal (auth.apex-corp.internal)</option>
                      <option value="ShopSphere">ShopSphere (shop.sphere-retail.com)</option>
                      <option value="MedVault">MedVault (records.medvault-health.org)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1">Target HTTP Endpoint</label>
                    <input
                      type="text"
                      disabled
                      value={
                        dispApp === 'ApexPortal'
                          ? 'POST /api/v1/auth/login'
                          : dispApp === 'ShopSphere'
                          ? 'GET /catalog/search?q='
                          : 'GET /api/records/mrn?id='
                      }
                      className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-mono text-zinc-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">HTTP Parameter Body / Query Payload</label>
                  <textarea
                    rows={3}
                    value={dispPayload}
                    onChange={(e) => setDispPayload(e.target.value)}
                    placeholder="Enter query parameter value..."
                    className="w-full rounded border border-zinc-700 bg-zinc-950 p-3 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[11px] font-mono text-zinc-500">Evaluates regex rules &amp; updates telemetry stream</span>
                  <button
                    type="submit"
                    className="rounded bg-amber-500 hover:bg-amber-400 px-5 py-2 text-xs font-semibold text-zinc-950 transition-colors shadow-sm"
                  >
                    Dispatch Request
                  </button>
                </div>
              </form>

              {/* Evaluation Result */}
              {dispResult && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Dispatch Verdict</span>
                    <span className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-xs font-mono font-semibold ${
                      dispResult.verdict === 'BLOCKED'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {dispResult.httpStatus} {dispResult.verdict}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-mono leading-relaxed">{dispResult.explanation}</p>

                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-zinc-500 uppercase block">Vulnerable Query (Concatenation)</span>
                    <CodeBlock code={dispResult.vulnerableSql} highlight={dispResult.verdict === 'BLOCKED'} />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-zinc-500 uppercase block">Secure Query (Parameterized Prepared Statement)</span>
                    <CodeBlock code={`${dispResult.secureSql}\n-- Bound: ${JSON.stringify(dispResult.secureParams)}`} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MITIGATION SPECS */}
          {activeTab === 'mitigation' && (
            <div className="space-y-6 max-w-4xl animate-in fade-in duration-150">
              <h2 className="text-sm font-mono font-semibold uppercase text-zinc-200">Mitigation Architecture: Prepared Statements</h2>

              {/* App selector */}
              <div className="flex rounded-md border border-zinc-800 bg-zinc-900 p-0.5 text-xs font-mono w-fit">
                {['ApexPortal', 'ShopSphere', 'MedVault'].map((app) => (
                  <button
                    key={app}
                    onClick={() => setMitApp(app)}
                    className={`rounded px-3 py-1.5 transition-colors ${
                      mitApp === app ? 'bg-zinc-800 text-zinc-100 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {app}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Vulnerable */}
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 font-mono uppercase">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Insecure: String Concatenation</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    User input is concatenated into the SQL statement before the database parses syntax. This allows control characters like quotes and comment dashes to alter the syntax tree.
                  </p>
                  <CodeBlock
                    language="javascript"
                    highlight={true}
                    code={
                      mitApp === 'ApexPortal'
                        ? `// INSECURE CONCATENATION\nconst query = \`SELECT * FROM users\n  WHERE username = '\${username}'\n  AND password = '\${password}'\`;\nawait db.query(query);`
                        : mitApp === 'ShopSphere'
                        ? `// INSECURE CONCATENATION\nconst query = \`SELECT * FROM products\n  WHERE name LIKE '%\${q}%'\`;\nawait db.query(query);`
                        : `// INSECURE CONCATENATION\nconst query = \`SELECT * FROM records\n  WHERE id = \${mrnId}\`;\nawait db.query(query);`
                    }
                  />
                </div>

                {/* Secure */}
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono uppercase">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Secure: Parameterized Statement</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    The query structure is compiled first into an execution plan. Input parameters are sent through a separate binary protocol and bound purely as literal values.
                  </p>
                  <CodeBlock
                    language="javascript"
                    code={
                      mitApp === 'ApexPortal'
                        ? `// PARAMETERIZED STATEMENT\nconst query = 'SELECT * FROM users WHERE username = ? AND password = ?';\nawait db.query(query, [username, password]);`
                        : mitApp === 'ShopSphere'
                        ? `// PARAMETERIZED STATEMENT\nconst query = 'SELECT * FROM products WHERE name LIKE ?';\nawait db.query(query, [\`%\${q}%\`]);`
                        : `// PARAMETERIZED STATEMENT\nconst query = 'SELECT * FROM records WHERE id = ?';\nawait db.query(query, [parseInt(mrnId)]);`
                    }
                  />
                </div>
              </div>

              {/* Technical Mechanics */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 space-y-2 text-xs text-zinc-400 font-mono">
                <span className="text-zinc-200 font-semibold uppercase block">Compiler Execution Phases</span>
                <div className="grid sm:grid-cols-3 gap-3 pt-2 text-[11px]">
                  <div className="rounded bg-zinc-950 p-3 border border-zinc-800">
                    <span className="text-amber-400 font-bold block mb-1">1. Compilation</span>
                    Database parses query template and generates immutable execution plan before receiving user data.
                  </div>
                  <div className="rounded bg-zinc-950 p-3 border border-zinc-800">
                    <span className="text-amber-400 font-bold block mb-1">2. Data Binding</span>
                    Inputs are transmitted as distinct data values, not executable SQL tokens or keywords.
                  </div>
                  <div className="rounded bg-zinc-950 p-3 border border-zinc-800">
                    <span className="text-amber-400 font-bold block mb-1">3. Type Enforcement</span>
                    Numeric, date, and string types are enforced by the database driver prior to execution.
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Slide-out Inspector Drawer */}
      {selectedLog && (
        <RequestInspector log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}
