'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  Activity,
  Layers,
  Terminal,
  BookOpen,
  ExternalLink,
  Server,
  Zap,
  Lock,
  Cpu,
} from 'lucide-react';

export default function Sidebar({ activeTab, onTabChange }) {
  const pathname = usePathname();

  const navItems = [
    { id: 'traffic', label: 'Traffic Analyzer', icon: Activity, badge: 'LIVE' },
    { id: 'rules', label: 'WAF Signature Rules', icon: Layers, count: '12' },
    { id: 'dispatcher', label: 'Payload Dispatcher', icon: Terminal },
    { id: 'mitigation', label: 'Mitigation Specs', icon: BookOpen },
  ];

  const targetApps = [
    { name: 'ApexPortal', type: 'Corporate SSO', href: '/demos/login', dot: 'bg-blue-400' },
    { name: 'ShopSphere', type: 'E-Commerce Store', href: '/demos/search', dot: 'bg-amber-400' },
    { name: 'MedVault', type: 'Clinical EHR', href: '/demos/union', dot: 'bg-emerald-400' },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-zinc-800 bg-zinc-950/95 flex flex-col justify-between h-screen sticky top-0 font-sans z-30 select-none">
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 pb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-sm">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-zinc-100 text-sm">SQLGuard</span>
              <span className="rounded border border-zinc-700 bg-zinc-800 px-1 py-0.2 font-mono text-[9px] text-zinc-400">v2.4</span>
            </div>
            <span className="font-mono text-[10px] text-zinc-500 block">WAF &amp; Traffic Inspection</span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <span className="px-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1.5 font-semibold">
            Security Console
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange?.(item.id)}
                className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 text-[9px] font-mono text-emerald-400 animate-pulse font-bold">
                    {item.badge}
                  </span>
                )}
                {item.count && (
                  <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[10px] font-mono text-zinc-400">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Monitored Products Section */}
        <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
              Monitored Target Apps
            </span>
            <span className="text-[9px] font-mono text-zinc-600">ISOLATED UI</span>
          </div>

          <div className="space-y-1">
            {targetApps.map((app) => (
              <Link
                key={app.name}
                href={app.href}
                target="_blank"
                className="group flex items-center justify-between rounded-lg border border-zinc-850 bg-zinc-900/40 px-2.5 py-2 text-xs hover:border-zinc-700 hover:bg-zinc-900 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${app.dot}`} />
                    <span className="font-semibold text-zinc-200 group-hover:text-white text-xs">{app.name}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono block pl-3.5">{app.type}</span>
                </div>
                <ExternalLink className="h-3 w-3 text-zinc-500 group-hover:text-zinc-300" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* System Telemetry Footer */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-950/60 font-mono text-[10px] text-zinc-400 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-zinc-500">
            <Cpu className="h-3 w-3 text-emerald-400" /> Edge Engine
          </span>
          <span className="text-emerald-400 font-semibold">ACTIVE</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-500">Latency:</span>
          <span className="text-zinc-300">0.8 ms avg</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-500">Runtime:</span>
          <span className="text-zinc-300">Cloudflare Worker</span>
        </div>
      </div>
    </aside>
  );
}
