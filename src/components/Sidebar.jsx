'use client';

import {
  Shield,
  Activity,
  Cpu,
  Binary,
  FlaskConical,
  BookOpen,
  Layers,
} from 'lucide-react';

export default function Sidebar({ activeTab, onTabChange }) {
  const navItems = [
    { id: 'traffic', label: 'Traffic Telemetry', icon: Activity, badge: 'LIVE', shortcut: '1' },
    { id: 'simulator', label: 'SQLi Anatomy & AST', icon: Layers, badge: 'SIM', shortcut: '2' },
    { id: 'lexer', label: 'Lexical Entropy Lab', icon: Binary, shortcut: '3' },
    { id: 'benchmark', label: 'Evasion Research Matrix', icon: FlaskConical, shortcut: '4' },
    { id: 'mitigation', label: 'Compiler Defense Specs', icon: BookOpen, shortcut: '5' },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col justify-between h-screen sticky top-0 font-sans z-30 select-none">
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800/80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-sm">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-zinc-100 text-sm">SQLGuard</span>
              <span className="rounded border border-zinc-700 bg-zinc-800 px-1 py-0.2 font-mono text-[9px] text-zinc-400 font-semibold">v2.4</span>
            </div>
            <span className="font-mono text-[10px] text-zinc-500 block">WAF Inspection Engine</span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
              Security Console
            </span>
            <span className="text-[9px] font-mono text-zinc-600">[KEYS 1-5]</span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange?.(item.id)}
                className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 text-[9px] font-mono text-emerald-400 animate-pulse font-bold">
                      {item.badge}
                    </span>
                  )}
                  <kbd className="hidden sm:inline-block rounded border border-zinc-800 bg-zinc-900 px-1 font-mono text-[9px] text-zinc-500">
                    {item.shortcut}
                  </kbd>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* System Telemetry Footer */}
      <div className="p-3.5 border-t border-zinc-800 bg-zinc-950 font-mono text-[10px] text-zinc-400 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-zinc-500">
            <Cpu className="h-3 w-3 text-emerald-400" /> WAF Runtime
          </span>
          <span className="text-emerald-400 font-semibold">ONLINE (EDGE)</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-500">Inspection Latency:</span>
          <span className="text-zinc-300">0.8 ms</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-500">Architecture:</span>
          <span className="text-zinc-300">Lexer + AST Engine</span>
        </div>
      </div>
    </aside>
  );
}
