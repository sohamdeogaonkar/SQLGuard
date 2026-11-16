'use client';

import Link from 'next/link';
import { ExternalLink, Building2, ShoppingBag, Hospital } from 'lucide-react';

export default function DemoAppsHub() {
  const apps = [
    {
      id: 'apex',
      name: 'ApexPortal',
      host: 'auth.apex-corp.internal',
      href: '/demos/login',
      icon: Building2,
    },
    {
      id: 'shopsphere',
      name: 'ShopSphere',
      host: 'store.shopsphere.io',
      href: '/demos/search',
      icon: ShoppingBag,
    },
    {
      id: 'medvault',
      name: 'MedVault',
      host: 'ehr.stjude-health.internal',
      href: '/demos/union',
      icon: Hospital,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl font-sans">
      <div className="border-b border-zinc-800 pb-3">
        <h2 className="text-base font-bold text-zinc-100 uppercase tracking-wide font-mono">
          Demo Apps
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {apps.map((app) => {
          const Icon = app.icon;
          return (
            <div
              key={app.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 flex flex-col justify-between hover:border-zinc-700 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700/60 text-zinc-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-100">{app.name}</h3>
                </div>
                <div className="font-mono text-xs text-zinc-400 truncate">
                  {app.host}
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-zinc-800/80">
                <Link
                  href={app.href}
                  target="_blank"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs px-3 py-2 transition-colors shadow-sm"
                >
                  <span>Launch App</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
