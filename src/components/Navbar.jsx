'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, ExternalLink, Activity, Terminal, BookOpen, Layers } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  // If inside one of the standalone demo apps, render the subtle "Monitored by SQLGuard" overlay bar
  const isDemoApp = pathname.startsWith('/demos/');

  if (isDemoApp) {
    let appName = 'Target Application';
    let appEndpoint = '/';
    if (pathname.includes('/login')) {
      appName = 'ApexPortal SSO';
      appEndpoint = 'POST /api/v1/auth/login';
    } else if (pathname.includes('/search')) {
      appName = 'ShopSphere Retail';
      appEndpoint = 'GET /catalog/search';
    } else if (pathname.includes('/union')) {
      appName = 'MedVault EHR';
      appEndpoint = 'GET /api/records/mrn';
    }

    return (
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur px-4 py-2 text-xs text-zinc-400">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-zinc-300 font-semibold">{appName}</span>
            <span className="text-zinc-600">|</span>
            <span className="font-mono text-zinc-500">{appEndpoint}</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">Protected by <strong className="text-amber-400">SQLGuard WAF</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 text-zinc-200 transition-colors font-medium"
            >
              <Activity className="h-3.5 w-3.5 text-amber-400" />
              Open SQLGuard Console
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-zinc-100 text-sm">SQLGuard</span>
              <span className="ml-2 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">WAF v2.4</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              Traffic Analyzer
            </Link>
            <Link
              href="/learn"
              className={`px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/learn' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              Mitigation Specs
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-mono text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            EDGE ACTIVE (0.9ms)
          </div>

          {/* Quick Target Apps Launcher */}
          <div className="flex items-center gap-1 border-l border-zinc-800 pl-3">
            <span className="text-[11px] text-zinc-500 hidden lg:inline mr-1">Target Apps:</span>
            <Link
              href="/demos/login"
              target="_blank"
              className="inline-flex items-center gap-1 rounded border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 transition-colors"
            >
              ApexPortal <ExternalLink className="h-3 w-3 text-zinc-500" />
            </Link>
            <Link
              href="/demos/search"
              target="_blank"
              className="inline-flex items-center gap-1 rounded border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 transition-colors"
            >
              ShopSphere <ExternalLink className="h-3 w-3 text-zinc-500" />
            </Link>
            <Link
              href="/demos/union"
              target="_blank"
              className="inline-flex items-center gap-1 rounded border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 transition-colors"
            >
              MedVault <ExternalLink className="h-3 w-3 text-zinc-500" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
