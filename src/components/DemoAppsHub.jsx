'use client';

import Link from 'next/link';
import {
  Building2,
  ShoppingBag,
  Hospital,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Lock,
  Globe,
  Terminal,
} from 'lucide-react';

export default function DemoAppsHub() {
  const apps = [
    {
      id: 'apex',
      name: 'ApexPortal',
      tagline: 'Enterprise Identity & Access Management',
      href: '/demos/login',
      host: 'auth.apex-corp.internal',
      icon: Building2,
      accent: 'blue',
      badge: 'SSO GATEWAY',
      vector: "Tautology Bypass: admin' OR '1'='1' --",
      desc: 'Simulates a corporate Single Sign-On (SSO) login screen. Demonstrates how authentication queries without parameterization are vulnerable to boolean tautologies that bypass password verification.',
      ruleTrigger: 'RULE-SQLI-TAUTOLOGY & COMMENT_SEQUENCE',
    },
    {
      id: 'shopsphere',
      name: 'ShopSphere',
      tagline: 'Consumer Hardware & Electronics Store',
      href: '/demos/search',
      host: 'store.shopsphere.io',
      icon: ShoppingBag,
      accent: 'orange',
      badge: 'E-COMMERCE CATALOG',
      vector: "UNION Exfiltration: ' UNION SELECT cc, cvv --",
      desc: 'Simulates an e-commerce hardware catalog with search filtering. Demonstrates how unparameterized LIKE queries allow attackers to append secondary UNION queries to dump confidential tables.',
      ruleTrigger: 'RULE-SQLI-UNION-SELECT',
    },
    {
      id: 'medvault',
      name: 'MedVault',
      tagline: 'Hospital Clinical EHR Patient Records',
      href: '/demos/union',
      host: 'ehr.stjude-health.internal',
      icon: Hospital,
      accent: 'teal',
      badge: 'HEALTHCARE EHR',
      vector: 'Database Fingerprinting & Column Probes',
      desc: 'Simulates an inpatient hospital electronic health record portal. Demonstrates how integer ID parameters without type enforcement allow attackers to probe column counts and extract patient charts.',
      ruleTrigger: 'RULE-SQLI-ORDER-BY-INSPECTION',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-150 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Protected Environments
            </span>
          </div>
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight mt-0.5">
            Target Demonstration Applications
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            These standalone web applications are monitored and protected by SQLGuard WAF. Launch any application in a new tab to test live attack payloads.
          </p>
        </div>
      </div>

      {/* Quick Testing Instructions Banner */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 font-mono text-xs text-zinc-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 font-bold text-xs shrink-0 mt-0.5">
            💡
          </div>
          <div className="space-y-1">
            <span className="text-zinc-200 font-bold block text-xs font-sans">
              How to demonstrate SQLGuard WAF in action:
            </span>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
              1. Click <strong>Launch App</strong> to open the target app in a separate browser tab.<br />
              2. Use the floating <strong>🧪 Payload Lab</strong> in the bottom-right corner of the app to send attack payloads.<br />
              3. Return to the <strong>Live Traffic Stream</strong> tab here to watch SQLGuard intercept and log the request with HTTP 403.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {apps.map((app) => {
          const Icon = app.icon;
          return (
            <div
              key={app.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-800/90 bg-zinc-900/40 p-5 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all shadow-lg group"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 group-hover:text-amber-400 group-hover:border-amber-400/40 transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100 group-hover:text-white">
                        {app.name}
                      </h3>
                      <span className="text-[10px] font-mono text-zinc-500 block">
                        {app.host}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="inline-block rounded border border-zinc-800 bg-zinc-950 px-2 py-0.5 font-mono text-[9px] text-zinc-400 font-semibold uppercase">
                  {app.badge}
                </span>

                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                  {app.desc}
                </p>

                {/* Attack Vector Box */}
                <div className="rounded-lg bg-zinc-950/80 border border-zinc-800/80 p-2.5 font-mono text-[11px] space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase block font-semibold">
                    Injection Vector Tested:
                  </span>
                  <span className="text-amber-300 font-medium block truncate">
                    {app.vector}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-2 border-t border-zinc-800/80">
                <Link
                  href={app.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-2.5 text-xs font-semibold shadow-sm transition-all group-hover:bg-amber-500 group-hover:text-zinc-950"
                >
                  <span>Launch Application</span>
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
