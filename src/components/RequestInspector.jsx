'use client';

import { X, ShieldAlert, ShieldCheck, Terminal, Server, ArrowRight } from 'lucide-react';
import CodeBlock from './CodeBlock';
import RiskBadge from './RiskBadge';

export default function RequestInspector({ log, onClose }) {
  if (!log) return null;

  const isBlocked = log.verdict === 'BLOCKED';

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl border-l border-zinc-800 bg-zinc-950 p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
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
          <h2 className="mt-1 font-mono text-sm font-semibold text-zinc-100">
            {log.method} {log.endpoint}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-5 space-y-6">
        {/* Network & Routing Metadata */}
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3.5 text-xs font-mono">
          <div>
            <span className="text-zinc-500 block">Target Application</span>
            <span className="text-zinc-200 font-medium">{log.targetApp}</span>
          </div>
          <div>
            <span className="text-zinc-500 block">Client IP</span>
            <span className="text-zinc-200 font-medium">{log.clientIp}</span>
          </div>
          <div>
            <span className="text-zinc-500 block">Inspection Latency</span>
            <span className="text-emerald-400 font-medium">{log.latencyMs} ms</span>
          </div>
          <div>
            <span className="text-zinc-500 block">Timestamp</span>
            <span className="text-zinc-300">{new Date(log.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Captured Input Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-mono text-zinc-400 uppercase">Captured Payload (Parameter: `{log.field}`)</span>
            <RiskBadge level={log.level} score={log.riskScore} />
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 font-mono text-sm text-amber-300 break-all select-all">
            {log.payload}
          </div>
        </div>

        {/* Threat Signature Details */}
        <div>
          <span className="text-xs font-mono text-zinc-400 uppercase block mb-1.5">WAF Rule Analysis</span>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Mitigation Rule:</span>
              <span className="font-mono text-zinc-200 bg-zinc-800 px-2 py-0.5 rounded">{log.mitigationRule}</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">{log.explanation}</p>

            {log.matches && log.matches.length > 0 && (
              <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
                <span className="text-[11px] font-mono text-zinc-500 uppercase block">Matched Signatures</span>
                {log.matches.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded bg-zinc-950 px-2.5 py-1.5 text-xs font-mono">
                    <span className="text-zinc-300">{m.name}</span>
                    <span className="text-amber-400">Match: `{m.matched}`</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Query Simulation */}
        <div className="space-y-4">
          <span className="text-xs font-mono text-zinc-400 uppercase block">Database Query Comparison</span>

          {/* Vulnerable */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-red-400">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Without Protection (String Concatenation Injection)</span>
            </div>
            <CodeBlock code={log.vulnerableSql || '--'} highlight={isBlocked} />
            <p className="text-[11px] text-zinc-500">
              Input breaks the string literal context and modifies query execution logic.
            </p>
          </div>

          {/* Secure */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Safe Alternative (Parameterized Prepared Statement)</span>
            </div>
            <CodeBlock code={`${log.secureSql || '--'}\n-- Bound Parameters: ${JSON.stringify(log.secureParams || [])}`} />
            <p className="text-[11px] text-zinc-500">
              Database driver treats input strictly as literal parameter data. Code structure is immutable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
