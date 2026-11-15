'use client';

import { useEffect } from 'react';
import { X, ShieldAlert, ShieldCheck, Terminal, Server, ArrowRight, Copy, Check } from 'lucide-react';
import CodeBlock from './CodeBlock';
import RiskBadge from './RiskBadge';

export default function RequestInspector({ log, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!log) return null;

  const isBlocked = log.verdict === 'BLOCKED';

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl border-l border-zinc-800 bg-zinc-950 p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-zinc-500 uppercase">{log.id}</span>
            <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono font-semibold ${
              isBlocked ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {log.httpStatus} {log.verdict}
            </span>
          </div>
          <h2 className="mt-1 font-mono text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <span className={`px-1.5 py-0.2 rounded text-[10px] ${
              log.method === 'POST' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {log.method}
            </span>
            <span className="truncate">{log.endpoint}</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="hidden sm:inline-block rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-6">
        {/* Network & Routing Metadata */}
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3.5 text-xs font-mono">
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Target Host</span>
            <span className="text-zinc-200 font-semibold">{log.targetApp}</span>
            <span className="text-zinc-500 text-[10px] block truncate">{log.targetHost}</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Client Origin IP</span>
            <span className="text-zinc-200 font-medium">{log.clientIp}</span>
            <span className="text-zinc-500 text-[10px] block">Edge Region: iad1</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Inspection Latency</span>
            <span className="text-emerald-400 font-medium">{log.latencyMs} ms</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Event Timestamp</span>
            <span className="text-zinc-300">{new Date(log.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Captured Input Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">
              Captured Parameter: <code className="text-amber-400">`{log.field}`</code>
            </span>
            <RiskBadge level={log.level} score={log.riskScore} />
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 font-mono text-xs text-amber-300 break-all select-all leading-relaxed">
            {log.payload}
          </div>
        </div>

        {/* Threat Signature Details */}
        <div>
          <span className="text-[11px] font-mono text-zinc-400 uppercase font-semibold block mb-1.5">
            WAF Mitigation Rule Applied
          </span>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Signature ID:</span>
              <span className="font-mono text-zinc-200 bg-zinc-800 px-2 py-0.5 rounded text-[11px]">{log.mitigationRule}</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-mono text-[11px]">{log.explanation}</p>

            {log.matches && log.matches.length > 0 && (
              <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Matched Regex Tokens</span>
                {log.matches.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded bg-zinc-950 px-2.5 py-1.5 text-xs font-mono">
                    <span className="text-zinc-300">{m.name}</span>
                    <span className="text-amber-400 font-semibold">Pattern: `{m.matched}`</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Query Simulation */}
        <div className="space-y-4">
          <span className="text-[11px] font-mono text-zinc-400 uppercase font-semibold block">
            Query Architecture Comparison
          </span>

          {/* Vulnerable */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400 font-mono">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>UNSANITIZED STRING CONCATENATION (INSECURE)</span>
            </div>
            <CodeBlock code={log.vulnerableSql || '--'} highlight={isBlocked} />
            <p className="text-[10px] text-zinc-500 font-mono">
              Attacker input breaks literal context and injects arbitrary SQL syntax tree tokens.
            </p>
          </div>

          {/* Secure */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 font-mono">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>PARAMETERIZED PREPARED STATEMENT (SECURE)</span>
            </div>
            <CodeBlock code={`${log.secureSql || '--'}\n-- Bound Data: ${JSON.stringify(log.secureParams || [])}`} />
            <p className="text-[10px] text-zinc-500 font-mono">
              Query plan is compiled prior to execution. Input is bound strictly as inert data values.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
