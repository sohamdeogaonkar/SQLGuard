'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, Trash2, RefreshCw } from 'lucide-react';
import { getLogs, getStats, clearLogs } from '../../lib/store';
import StatsCard from '../../components/StatsCard';
import RiskBadge from '../../components/RiskBadge';

export default function DashboardPage() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, blocked: 0, safe: 0, bySeverity: {}, topPatterns: {} });
  const [filter, setFilter] = useState('all');

  const refresh = () => {
    setLogs(getLogs());
    setStats(getStats());
  };

  useEffect(() => { refresh(); }, []);

  const filtered = filter === 'all' ? logs
    : filter === 'blocked' ? logs.filter(l => l.isMalicious)
    : logs.filter(l => !l.isMalicious);

  const handleClear = () => {
    clearLogs();
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-emerald-400" />
            Security Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Monitor detected attacks and analyze detection results.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={refresh} className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <button onClick={handleClear} className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatsCard label="Total Analyzed" value={stats.total} type="total" />
        <StatsCard label="Blocked" value={stats.blocked} type="blocked" />
        <StatsCard label="Allowed" value={stats.safe} type="safe" />
        <StatsCard label="Block Rate" value={stats.total ? `${Math.round((stats.blocked / stats.total) * 100)}%` : '0%'} type="alert" />
      </div>

      {/* Severity breakdown */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">Risk Distribution</h3>
        <div className="space-y-2">
          {[
            { label: 'Safe', count: stats.bySeverity.safe || 0, color: 'bg-emerald-500' },
            { label: 'Low', count: stats.bySeverity.low || 0, color: 'bg-yellow-500' },
            { label: 'Medium', count: stats.bySeverity.medium || 0, color: 'bg-amber-500' },
            { label: 'High', count: stats.bySeverity.high || 0, color: 'bg-orange-500' },
            { label: 'Critical', count: stats.bySeverity.critical || 0, color: 'bg-red-500' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="w-16 text-xs text-zinc-500">{s.label}</span>
              <div className="flex-1 h-4 rounded bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded ${s.color} transition-all duration-500`}
                  style={{ width: stats.total ? `${(s.count / stats.total) * 100}%` : '0%' }}
                />
              </div>
              <span className="w-8 text-right text-xs text-zinc-400">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top patterns */}
      {Object.keys(stats.topPatterns).length > 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Top Detected Patterns</h3>
          <div className="space-y-1.5">
            {Object.entries(stats.topPatterns)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 8)
              .map(([name, count]) => (
                <div key={name} className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-950 px-3 py-2">
                  <span className="text-sm text-zinc-300">{name}</span>
                  <span className="text-xs text-zinc-500">{count} hit{count !== 1 ? 's' : ''}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Logs table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-300">Attack Logs</h3>
          <div className="flex gap-1">
            {['all', 'blocked', 'allowed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-2.5 py-1 text-xs capitalize transition-colors ${
                  filter === f ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center">
            <p className="text-sm text-zinc-500">No logs yet. Use the Playground to analyze some inputs.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filtered.map((log) => (
              <div key={log.id} className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm code-font text-zinc-200 truncate">{log.input}</p>
                    <p className="text-xs text-zinc-500 mt-1 truncate">{log.explanation}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <RiskBadge level={log.level} score={log.riskScore} />
                    <span className="text-[10px] text-zinc-600 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
