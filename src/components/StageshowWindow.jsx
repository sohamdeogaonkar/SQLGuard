'use client';

import { Lock, ShieldCheck, RefreshCw, ChevronLeft, ChevronRight, Share2, Maximize2 } from 'lucide-react';

export default function StageshowWindow({
  url = 'https://app.internal',
  title = 'Application Window',
  badge = null,
  badgeTone = 'emerald', // 'emerald' | 'amber' | 'blue' | 'zinc'
  children,
  className = '',
  statusIndicator = null,
}) {
  const badgeStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    zinc: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/50',
  };

  return (
    <div className={`flex flex-col rounded-xl border border-zinc-800/80 bg-zinc-950/80 shadow-2xl overflow-hidden backdrop-blur-xl ${className}`}>
      {/* Stageshow Authentic Browser Window Chrome */}
      <div className="flex h-11 items-center justify-between border-b border-zinc-800/80 bg-zinc-900/90 px-4 text-xs select-none">
        {/* Left: Traffic Lights & Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] border border-[#e0443e]/50 shadow-sm" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e] border border-[#d89e24]/50 shadow-sm" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840] border border-[#1aab29]/50 shadow-sm" />
          </div>

          <div className="hidden sm:flex items-center gap-1 text-zinc-500 pl-2">
            <button className="rounded p-1 hover:text-zinc-300 hover:bg-zinc-800 transition-colors" disabled>
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button className="rounded p-1 hover:text-zinc-300 hover:bg-zinc-800 transition-colors" disabled>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button className="rounded p-1 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
              <RefreshCw className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Center: Authentic URL Capsule */}
        <div className="flex items-center justify-center max-w-md w-full px-2">
          <div className="flex w-full items-center justify-center gap-1.5 rounded-md border border-zinc-800/90 bg-zinc-950/90 px-3 py-1 font-mono text-[11px] text-zinc-400 shadow-inner">
            <Lock className="h-3 w-3 text-emerald-400 shrink-0" />
            <span className="truncate text-zinc-300 font-medium">{url}</span>
          </div>
        </div>

        {/* Right: Badge / Status Indicator */}
        <div className="flex items-center gap-2">
          {badge && (
            <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-mono font-medium ${badgeStyles[badgeTone] || badgeStyles.zinc}`}>
              <ShieldCheck className="h-2.5 w-2.5" />
              <span>{badge}</span>
            </span>
          )}
          {statusIndicator}
        </div>
      </div>

      {/* Main Window Body */}
      <div className="relative flex-1 overflow-auto bg-zinc-950 text-zinc-100">
        {children}
      </div>
    </div>
  );
}
