'use client';

import { useState, useEffect, useRef } from 'react';
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
  Cpu,
  Clock,
  Filter,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import RequestInspector from '../components/RequestInspector';
import CodeBlock from '../components/CodeBlock';
import RiskBadge from '../components/RiskBadge';
import { getLogs, getStats, clearLogs, recordInspection } from '../lib/store';
import { SQL_PATTERNS } from '../lib/patterns';

const TARGET_APPS = [
  {
    name: 'ApexPortal',
    type: 'Corporate IAM / SSO',
    host: 'auth.apex-corp.internal',
    endpoint: 'POST /api/v1/auth/login',
    href: '/demos/login',
    color: 'border-blue-500/30 text-blue-400 bg-blue-500/5',
    dot: 'bg-blue-400',
  },
  {
    name: 'ShopSphere',
    type: 'Consumer E-Commerce',
    host: 'shop.sphere-retail.com',
    endpoint: 'GET /catalog/search?q=',
    href: '/demos/search',
    color: 'border-amber-500/30 text-amber-400 bg-amber-500/5',
    dot: 'bg-amber-400',
  },
  {
    name: 'MedVault',
    type: 'Clinical Healthcare EHR',
    host: 'records.medvault-health.org',
    endpoint: 'GET /api/records/mrn?id=',
    href: '/demos/union',
    color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5',
    dot: 'bg-emerald-400',
  },
];

const QUICK_PAYLOADS = [
  { label: 'Normal Login', app: 'ApexPortal', payload: 'sarah.jenkins@apexcorp.internal' },
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

  const searchInputRef = useRef(null);

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

    // Global keyboard shortcuts: / to search, 1-4 for tabs, Esc to close
    const handleGlobalKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      if (e.key === '/' && !isInput) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setSelectedLog(null);
        if (isInput) document.activeElement?.blur();
      } else if (!isInput) {
        if (e.key === '1') setActiveTab('traffic');
        if (e.key === '2') setActiveTab('rules');
        if (e.key === '3') setActiveTab('dispatcher');
        if (e.key === '4') setActiveTab('mitigation');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      window.removeEventListener('sqlguard-log-created', handleNewLog);
      window.removeEventListener('sqlguard-log-cleared', handleNewLog);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('keydown', handleGlobalKeyDown);
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
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Console Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top High-Density Control Bar */}
        <header className="h-13 border-b border-zinc-800 bg-zinc-950 sticky top-0 z-20 px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider">CONSOLE /</span>
            <span className="text-xs font-semibold text-zinc-200 uppercase font-mono">
              {activeTab === 'traffic' && 'LIVE TRAFFIC STREAM'}
              {activeTab === 'rules' && 'WAF SIGNATURE MATRIX'}
              {activeTab === 'dispatcher' && 'PAYLOAD INJECTION BENCH'}
              {activeTab === 'mitigation' && 'PREPARED STATEMENT SPECS'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time Telemetry Pill */}
            <div className="hidden lg:flex items-center gap-4 text-xs font-mono border-r border-zinc-800 pr-4">
              <span className="text-zinc-500">CAPTURED: <strong className="text-zinc-200">{stats.total}</strong></span>
              <span className="text-zinc-500">BLOCKED: <strong className="text-rose-400 font-bold">{stats.blocked}</strong></span>
              <span className="text-zinc-500">ALLOWED: <strong className="text-emerald-400 font-bold">{stats.allowed}</strong></span>
              <span className="text-zinc-500">THREAT RATIO: <strong className="text-amber-400 font-bold">{stats.blockRate}%</strong></span>
            </div>

            <button
              onClick={refreshData}
              className="flex items-center gap-1.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 px-2.5 py-1 text-xs font-mono text-zinc-300 transition-colors"
            >
              <RefreshCw className="h-3 w-3 text-zinc-400" />
              <span>SYNC</span>
            </button>
            <button
              onClick={() => { clearLogs(); refreshData(); }}
              className="flex items-center gap-1.5 rounded bg-rose-500/5 border border-rose-500/20 hover:bg-rose-500/10 px-2.5 py-1 text-xs font-mono text-rose-400 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              <span>CLEAR</span>
            </button>
          </div>
        </header>

        {/* Console Main Body */}
        <main className="p-6 flex-1 space-y-6">
          {/* TAB 1: TRAFFIC ANALYZER */}
          {activeTab === 'traffic' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Target App Topology Row */}
              <div className="grid gap-3 md:grid-cols-3">
                {TARGET_APPS.map((app) => {
                  const count = logs.filter(l => l.targetApp === app.name).length;
                  const blocked = logs.filter(l => l.targetApp === app.name && l.verdict === 'BLOCKED').length;

                  return (
                    <div
                      key={app.name}
                      className="group flex flex-col justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-3.5 hover:border-zinc-700 transition-colors"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-mono font-medium ${app.color}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${app.dot}`} />
                            {app.name}
                          </span>
                          <span className="font-mono text-[11px] text-rose-400 font-bold">{blocked} DROPS</span>
                        </div>

                        <div className="font-mono text-xs text-zinc-300 font-medium truncate pt-1">
                          {app.endpoint}
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                        <span className="text-[11px] text-zinc-500">{count} events</span>
                        <Link
                          href={app.href}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-zinc-300 hover:text-white transition-colors text-[11px] font-semibold"
                        >
                          Launch Product <ArrowUpRight className="h-3 w-3 text-zinc-500 group-hover:text-zinc-300" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Filter Controls & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex rounded-md border border-zinc-800 bg-zinc-900 p-0.5 text-xs font-mono">
                    {['ALL', 'ApexPortal', 'ShopSphere', 'MedVault'].map((app) => (
                      <button
                        key={app}
                        onClick={() => setActiveAppFilter(app)}
                        className={`rounded px-2.5 py-1 transition-colors ${
                          activeAppFilter === app ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
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
                          activeVerdictFilter === v ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search IP, payload, rule... (Press /)"
                    className="w-full rounded-md border border-zinc-800 bg-zinc-900/90 pl-8 pr-12 py-1.5 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none"
                  />
                  <kbd className="absolute right-2.5 top-2 rounded border border-zinc-800 bg-zinc-950 px-1.5 py-0.2 font-mono text-[9px] text-zinc-500">
                    /
                  </kbd>
                </div>
              </div>

              {/* High-Density Traffic Table */}
              <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/40">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="border-b border-zinc-800 bg-zinc-900/90 text-zinc-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-3 py-2">Time</th>
                      <th className="px-3 py-2">Method</th>
                      <th className="px-3 py-2">Target App</th>
                      <th className="px-3 py-2">Route</th>
                      <th className="px-3 py-2">Payload</th>
                      <th className="px-3 py-2">Rule Trigger</th>
                      <th className="px-3 py-2">Latency</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-[11px]">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-zinc-500 font-mono">
                          No requests recorded. Trigger an action in one of the standalone target apps.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => {
                        const isBlocked = log.verdict === 'BLOCKED';
                        return (
                          <tr
                            key={log.id}
                            onClick={() => setSelectedLog(log)}
                            className="cursor-pointer hover:bg-zinc-850/60 transition-colors"
                          >
                            <td className="px-3 py-2 text-zinc-400 whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                                log.method === 'POST'
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {log.method}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap font-medium text-zinc-200">
                              {log.targetApp}
                            </td>
                            <td className="px-3 py-2 text-zinc-300 max-w-[150px] truncate">
                              {log.endpoint}
                            </td>
                            <td className="px-3 py-2 text-amber-300 max-w-[200px] truncate font-mono">
                              {log.payload}
                            </td>
                            <td className="px-3 py-2 text-zinc-400 whitespace-nowrap text-[10px]">
                              {log.mitigationRule}
                            </td>
                            <td className="px-3 py-2 text-zinc-400 whitespace-nowrap text-[10px]">
                              {log.latencyMs}ms
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                                  isBlocked
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                }`}
                              >
                                {log.httpStatus} {log.verdict}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right whitespace-nowrap">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLog(log);
                                }}
                                className="rounded bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 text-[10px] font-mono text-zinc-300 transition-colors"
                              >
                                View
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
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs font-mono font-semibold uppercase text-zinc-200">
                  DETERMINISTIC SIGNATURE MATRIX ({SQL_PATTERNS.length})
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  EDGE EVALUATION ACTIVE
                </span>
              </div>

              <div className="grid gap-2.5">
                {SQL_PATTERNS.map((p) => {
                  const matchCount = logs.reduce((acc, l) => {
                    return acc + (l.matches?.filter(m => m.patternId === p.id).length || 0);
                  }, 0);

                  return (
                    <div
                      key={p.id}
                      className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3.5 space-y-2 hover:border-zinc-700 transition-colors font-mono text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-200 text-xs">{p.name}</span>
                          <span className="text-[10px] text-zinc-500">ID: RULE-SQLI-{p.id.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-amber-400 font-bold">{matchCount} HITS</span>
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            p.severity >= 9 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            p.severity >= 7 ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}>
                            SEVERITY {p.severity}/10
                          </span>
                        </div>
                      </div>

                      <p className="text-zinc-400 font-sans text-xs">{p.description}</p>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-zinc-800/80 text-[11px]">
                        <div className="text-zinc-500 truncate max-w-md">
                          Pattern: <code className="text-zinc-300 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-850">{String(p.regex)}</code>
                        </div>
                        <div className="text-zinc-500">
                          Exploit Vector: <code className="text-amber-400 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-850">{p.example}</code>
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
            <div className="space-y-5 max-w-3xl animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs font-mono font-semibold uppercase text-zinc-200">
                  IN-LINE PAYLOAD DISPATCH BENCH
                </span>
                <span className="text-[10px] font-mono text-zinc-500">TEST INCOMING PARAMETER EVALUATION</span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">PRELOADED VECTORS:</span>
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

              {/* Dispatch Form */}
              <form onSubmit={handleDispatch} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1 font-semibold">Target Application</label>
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
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1 font-semibold">HTTP Endpoint Route</label>
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
                  <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1 font-semibold">Parameter Payload Input</label>
                  <textarea
                    rows={3}
                    value={dispPayload}
                    onChange={(e) => setDispPayload(e.target.value)}
                    placeholder="Enter SQL parameter input string..."
                    className="w-full rounded border border-zinc-700 bg-zinc-950 p-3 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-[10px] font-mono text-zinc-500">DISPATCHES EVENT &amp; RE-EVALUATES WAF RULES</span>
                  <button
                    type="submit"
                    className="rounded bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-mono font-bold text-zinc-950 transition-colors shadow-sm"
                  >
                    DISPATCH REQUEST →
                  </button>
                </div>
              </form>

              {/* Evaluation Result */}
              {dispResult && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-5 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">EVALUATION VERDICT</span>
                    <span className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-xs font-mono font-bold ${
                      dispResult.verdict === 'BLOCKED'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {dispResult.httpStatus} {dispResult.verdict}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-mono leading-relaxed">{dispResult.explanation}</p>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase font-semibold block">Vulnerable Query Translation (Concatenation)</span>
                    <CodeBlock code={dispResult.vulnerableSql} highlight={dispResult.verdict === 'BLOCKED'} />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase font-semibold block">Secure Query Translation (Parameterized Statement)</span>
                    <CodeBlock code={`${dispResult.secureSql}\n-- Bound: ${JSON.stringify(dispResult.secureParams)}`} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MITIGATION SPECS */}
          {activeTab === 'mitigation' && (
            <div className="space-y-5 max-w-4xl animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs font-mono font-semibold uppercase text-zinc-200">
                  QUERY COMPILER ARCHITECTURE: PREPARED STATEMENTS
                </span>
                <span className="text-[10px] font-mono text-zinc-500">AST COMPILER LEVEL DEFENSE</span>
              </div>

              {/* App selector */}
              <div className="flex rounded-md border border-zinc-800 bg-zinc-900 p-0.5 text-xs font-mono w-fit">
                {['ApexPortal', 'ShopSphere', 'MedVault'].map((app) => (
                  <button
                    key={app}
                    onClick={() => setMitApp(app)}
                    className={`rounded px-3 py-1.5 transition-colors ${
                      mitApp === app ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {app}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Vulnerable */}
                <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 font-mono uppercase">
                    <ShieldAlert className="h-4 w-4" />
                    <span>RAW STRING CONCATENATION (INSECURE)</span>
                  </div>
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
                  <p className="text-[11px] text-zinc-400 font-mono">
                    User input modifies the SQL syntax tree directly prior to database compilation.
                  </p>
                </div>

                {/* Secure */}
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono uppercase">
                    <ShieldCheck className="h-4 w-4" />
                    <span>PARAMETERIZED PREPARED STATEMENT (SECURE)</span>
                  </div>
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
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Execution plan is pre-compiled. Input parameters are bound strictly as inert data values.
                  </p>
                </div>
              </div>

              {/* Technical Mechanics */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 space-y-2 text-xs text-zinc-400 font-mono">
                <span className="text-zinc-200 font-semibold uppercase block text-[11px]">IMMUTABLE QUERY COMPILER PHASES</span>
                <div className="grid sm:grid-cols-3 gap-3 pt-2 text-[11px]">
                  <div className="rounded bg-zinc-950 p-3 border border-zinc-800">
                    <span className="text-amber-400 font-bold block mb-1">1. PRE-COMPILATION</span>
                    SQL syntax is analyzed and compiled into a query plan before any parameter data is received.
                  </div>
                  <div className="rounded bg-zinc-950 p-3 border border-zinc-800">
                    <span className="text-amber-400 font-bold block mb-1">2. TYPE ENFORCEMENT</span>
                    Numeric, string, and timestamp types are validated by the driver protocol before transmission.
                  </div>
                  <div className="rounded bg-zinc-950 p-3 border border-zinc-800">
                    <span className="text-amber-400 font-bold block mb-1">3. LITERAL BINDING</span>
                    Quotes and delimiters inside parameters are treated as literal text bytes, preventing syntax breakout.
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
