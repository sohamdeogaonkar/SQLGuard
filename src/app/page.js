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
  Binary,
  FlaskConical,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import RequestInspector from '../components/RequestInspector';
import CodeBlock from '../components/CodeBlock';
import RiskBadge from '../components/RiskBadge';
import SQLDetectorView from '../components/SQLDetectorView';
import DemoAppsHub from '../components/DemoAppsHub';
import { getLogs, getStats, clearLogs } from '../lib/store';

export default function SidebarDashboard() {
  const [activeTab, setActiveTab] = useState('detector'); // 'detector' | 'traffic' | 'demos'
  const [detectorQuery, setDetectorQuery] = useState("admin' OR '1'='1' --");
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, blocked: 0, allowed: 0, blockRate: 0, byApp: {} });
  const [activeAppFilter, setActiveAppFilter] = useState('ALL');
  const [activeVerdictFilter, setActiveVerdictFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const searchInputRef = useRef(null);

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
        if (e.key === '1') setActiveTab('detector');
        if (e.key === '2') setActiveTab('traffic');
        if (e.key === '3') setActiveTab('demos');
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

  const filteredLogs = logs.filter((log) => {
    if (activeAppFilter !== 'ALL' && log.targetApp !== activeAppFilter) return false;
    if (activeVerdictFilter === 'BLOCKED' && log.verdict !== 'BLOCKED') return false;
    if (activeVerdictFilter === 'ALLOWED' && log.verdict !== 'ALLOWED') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.payload?.toLowerCase().includes(q) ||
        log.clientIp?.toLowerCase().includes(q) ||
        log.endpoint?.toLowerCase().includes(q) ||
        log.targetApp?.toLowerCase().includes(q) ||
        log.mitigationRule?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500/20 selection:text-amber-300">
      {/* Simplified, Clutter-Free Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Console Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Control Bar */}
        <header className="h-13 border-b border-zinc-800 bg-zinc-950 sticky top-0 z-20 px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider">CONSOLE /</span>
            <span className="text-xs font-semibold text-zinc-200 uppercase font-mono">
              {activeTab === 'detector' && 'SQL DETECTOR'}
              {activeTab === 'traffic' && 'LIVE TRAFFIC'}
              {activeTab === 'demos' && 'DEMO APPS'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time Telemetry Stats */}
            <div className="hidden lg:flex items-center gap-4 text-xs font-mono border-r border-zinc-800 pr-4">
              <span className="text-zinc-500">CAPTURED: <strong className="text-zinc-200">{stats.total}</strong></span>
              <span className="text-zinc-500">DROPPED: <strong className="text-rose-400 font-bold">{stats.blocked}</strong></span>
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
              onClick={() => {
                clearLogs();
                refreshData();
              }}
              className="flex items-center gap-1.5 rounded bg-rose-500/5 border border-rose-500/20 hover:bg-rose-500/10 px-2.5 py-1 text-xs font-mono text-rose-400 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              <span>CLEAR</span>
            </button>
          </div>
        </header>

        {/* Console Main Body */}
        <main className="p-6 flex-1 space-y-6">
          {/* TAB 1: SQL DETECTOR (2-Tab layout: Query Test & Detectors List) */}
          {activeTab === 'detector' && (
            <SQLDetectorView
              onLogRecorded={refreshData}
              initialQuery={detectorQuery}
            />
          )}

          {/* TAB 2: TRAFFIC STREAM */}
          {activeTab === 'traffic' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Filter Controls & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex rounded-md border border-zinc-800 bg-zinc-900 p-0.5 text-xs font-mono">
                    {['ALL', 'ApexPortal', 'ShopSphere', 'MedVault'].map((app) => (
                      <button
                        key={app}
                        onClick={() => setActiveAppFilter(app)}
                        className={`rounded px-2.5 py-1 transition-colors ${activeAppFilter === app ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
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
                        className={`rounded px-2.5 py-1 transition-colors ${activeVerdictFilter === v ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
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
                      <th className="px-3 py-2">Target Host</th>
                      <th className="px-3 py-2">Route</th>
                      <th className="px-3 py-2">Parameter Payload</th>
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
                              <span
                                className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${log.method === 'POST'
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  }`}
                              >
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
                                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${isBlocked
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

          {/* TAB 3: DEMO APPS */}
          {activeTab === 'demos' && (
            <div className="animate-in fade-in duration-150">
              <DemoAppsHub />
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
