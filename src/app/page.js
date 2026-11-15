'use client';

import Link from 'next/link';
import { Shield, Terminal, FlaskConical, LayoutDashboard, BookOpen, ChevronRight, Zap, Eye, Lock } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Real-time Detection',
    desc: 'Analyzes inputs against 12+ SQL injection patterns with instant risk scoring.',
  },
  {
    icon: Eye,
    title: 'Pattern Matching',
    desc: 'Identifies tautologies, UNION attacks, stacked queries, time-based blind SQLi, and more.',
  },
  {
    icon: Lock,
    title: 'Risk Classification',
    desc: 'Scores threats from 0–100 and classifies as Safe, Low, Medium, High, or Critical.',
  },
];

const pages = [
  {
    href: '/demos/playground',
    icon: Terminal,
    title: 'Playground',
    desc: 'Test any input against the detection engine in real time.',
    color: 'text-amber-400',
  },
  {
    href: '/demos/login',
    icon: FlaskConical,
    title: 'Login Injection Demo',
    desc: 'See how login forms are exploited with SQL injection.',
    color: 'text-zinc-400',
  },
  {
    href: '/demos/search',
    icon: FlaskConical,
    title: 'Search Injection Demo',
    desc: 'Demonstrates injection through search functionality.',
    color: 'text-zinc-400',
  },
  {
    href: '/demos/union',
    icon: FlaskConical,
    title: 'UNION-based Demo',
    desc: 'Shows how UNION SELECT extracts data from other tables.',
    color: 'text-zinc-400',
  },
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    title: 'Security Dashboard',
    desc: 'Monitor detected attacks, view logs, and analyze results.',
    color: 'text-emerald-400',
  },
  {
    href: '/learn',
    icon: BookOpen,
    title: 'Vulnerable vs Secure',
    desc: 'Compare string concatenation with parameterized queries.',
    color: 'text-blue-400',
  },
];

export default function Home() {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero */}
      <section className="pt-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full border border-zinc-800 bg-zinc-900 p-3">
            <Shield className="h-8 w-8 text-amber-500" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          SQL<span className="text-amber-500">Guard</span>
        </h1>
        <p className="mt-3 text-lg text-zinc-400 max-w-xl mx-auto">
          SQL Injection Detection &amp; Prevention System.
          Analyze inputs, identify attack patterns, and block malicious queries.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/demos/playground"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-amber-400 transition-colors"
          >
            Open Playground
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-4 sm:grid-cols-3">
        {features.map(f => (
          <div key={f.title} className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <f.icon className="h-5 w-5 text-amber-500 mb-3" />
            <h3 className="font-medium text-zinc-100">{f.title}</h3>
            <p className="mt-1 text-sm text-zinc-400">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Pages grid */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Explore</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map(p => (
            <Link
              key={p.href}
              href={p.href}
              className="group flex flex-col rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <p.icon className={`h-4 w-4 ${p.color}`} />
                <h3 className="font-medium text-zinc-100 group-hover:text-white">{p.title}</h3>
              </div>
              <p className="text-sm text-zinc-500">{p.desc}</p>
              <span className="mt-auto pt-3 text-xs text-zinc-600 group-hover:text-zinc-400 flex items-center gap-1">
                Open <ChevronRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
