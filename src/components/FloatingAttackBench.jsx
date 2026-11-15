'use client';

import { useState } from 'react';
import { Zap, X, ChevronUp, ChevronDown, Terminal, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function FloatingAttackBench({ title = 'Security Attack Vectors', presets = [], onSelect, themeColor = 'amber' }) {
  const [isOpen, setIsOpen] = useState(false);

  const colors = {
    teal: {
      pill: 'border-teal-500/30 text-teal-300 bg-zinc-900/90 hover:border-teal-400 hover:bg-zinc-800/90',
      badge: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      dot: 'bg-teal-400',
    },
    orange: {
      pill: 'border-orange-500/30 text-orange-300 bg-zinc-900/90 hover:border-orange-400 hover:bg-zinc-800/90',
      badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      dot: 'bg-orange-400',
    },
    blue: {
      pill: 'border-blue-500/30 text-blue-300 bg-zinc-900/90 hover:border-blue-400 hover:bg-zinc-800/90',
      badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      dot: 'bg-blue-400',
    },
    amber: {
      pill: 'border-amber-500/30 text-amber-300 bg-zinc-900/90 hover:border-amber-400 hover:bg-zinc-800/90',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      dot: 'bg-amber-400',
    },
  };

  const currentTheme = colors[themeColor] || colors.amber;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Expanded Satellite Popover Card */}
      {isOpen && (
        <div className="mb-2.5 w-84 sm:w-96 rounded-xl border border-zinc-800 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-150 text-left font-sans ring-1 ring-zinc-800/50">
          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${currentTheme.dot} animate-pulse`} />
              <span className="text-xs font-mono font-semibold text-zinc-100">{title}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded p-1 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-[11px] text-zinc-400 mt-2 mb-3">
            Select a test vector to inject into this application and observe real-time WAF telemetry in the console.
          </p>

          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelect?.(p);
                }}
                className={`w-full text-left rounded-lg border p-2.5 transition-all text-xs group ${
                  p.isMalicious
                    ? 'border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 hover:border-rose-500/40 text-rose-200'
                    : 'border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-semibold text-[11px] truncate">{p.label}</span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold border shrink-0 ${
                      p.isMalicious
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {p.isMalicious ? 'EXPLOIT' : 'BENIGN'}
                  </span>
                </div>
                {p.desc && (
                  <p className="text-[10px] text-zinc-400 mt-1 line-clamp-1">{p.desc}</p>
                )}
              </button>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>Dispatches to WAF edge filter</span>
            <button onClick={() => setIsOpen(false)} className="hover:text-zinc-300">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Satellite Floating Trigger Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-mono font-semibold shadow-2xl backdrop-blur-md transition-all ${currentTheme.pill}`}
      >
        <span className={`h-2 w-2 rounded-full ${currentTheme.dot} animate-pulse`} />
        <span>Payload Lab ({presets.length})</span>
        {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
