'use client';

import { useState } from 'react';
import { Zap, X, ShieldAlert, ChevronUp, ChevronDown, Terminal } from 'lucide-react';

export default function FloatingAttackBench({ title = 'Security Injection Lab', presets = [], onSelect, themeColor = 'amber' }) {
  const [isOpen, setIsOpen] = useState(false);

  const colors = {
    teal: {
      pill: 'border-teal-500/40 text-teal-300 bg-slate-900/95 hover:border-teal-400',
      badge: 'bg-teal-500/20 text-teal-300',
      glow: 'shadow-teal-500/10',
    },
    orange: {
      pill: 'border-orange-500/40 text-orange-300 bg-neutral-900/95 hover:border-orange-400',
      badge: 'bg-orange-500/20 text-orange-300',
      glow: 'shadow-orange-500/10',
    },
    blue: {
      pill: 'border-blue-500/40 text-blue-300 bg-slate-900/95 hover:border-blue-400',
      badge: 'bg-blue-500/20 text-blue-300',
      glow: 'shadow-blue-500/10',
    },
    amber: {
      pill: 'border-amber-500/40 text-amber-300 bg-zinc-900/95 hover:border-amber-400',
      badge: 'bg-amber-500/20 text-amber-300',
      glow: 'shadow-amber-500/10',
    },
  };

  const currentTheme = colors[themeColor] || colors.amber;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Expanded Floating Popover Card */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-xl border border-zinc-800 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200 text-left font-sans">
          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
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
            Click any vector below to dispatch payload into this application and observe SQLGuard WAF inspection.
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
                    ? 'border-red-500/20 bg-red-500/5 hover:bg-red-500/15 hover:border-red-500/40 text-red-200'
                    : 'border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-[11px] truncate">{p.label}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                    p.isMalicious ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {p.isMalicious ? 'ATTACK' : 'CLEAN'}
                  </span>
                </div>
                {p.desc && (
                  <p className="text-[10px] text-zinc-400 mt-1 line-clamp-1">{p.desc}</p>
                )}
              </button>
            ))}
          </div>

          <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>Payload dispatches via API</span>
            <button onClick={() => setIsOpen(false)} className="hover:text-zinc-300 underline">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Trigger Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-mono font-semibold shadow-2xl backdrop-blur-md transition-all ${currentTheme.pill} ${currentTheme.glow}`}
      >
        <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
        <span>Payload Lab ({presets.length})</span>
        {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
