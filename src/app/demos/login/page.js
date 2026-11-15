'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Lock, Building2, AlertOctagon, CheckCircle2, ArrowRight, RefreshCw, KeyRound, ExternalLink } from 'lucide-react';
import { recordInspection } from '../../../lib/store';

const ATTACK_PRESETS = [
  {
    label: 'Normal Employee',
    user: 'sarah.jenkins@apexcorp.com',
    pass: 'K9#xL92@mPq',
    desc: 'Benign corporate single sign-on request',
    isMalicious: false,
  },
  {
    label: "Tautology: ' OR '1'='1' --",
    user: "admin' OR '1'='1' --",
    pass: 'anypass',
    desc: 'Forces query WHERE clause to evaluate to TRUE',
    isMalicious: true,
  },
  {
    label: "Admin Cutoff: admin'--",
    user: "admin'--",
    pass: '',
    desc: 'Truncates password validation logic using SQL comments',
    isMalicious: true,
  },
  {
    label: "Char Obfuscation",
    user: "' OR CHAR(49)=CHAR(49) --",
    pass: 'x',
    desc: 'Evades simple string filters using ASCII char codes',
    isMalicious: true,
  },
];

export default function ApexPortalLogin() {
  const [username, setUsername] = useState('sarah.jenkins@apexcorp.com');
  const [password, setPassword] = useState('••••••••••••');
  const [status, setStatus] = useState('IDLE'); // 'IDLE' | 'ALLOWED' | 'BLOCKED'
  const [interceptEvent, setInterceptEvent] = useState(null);

  const handleSignIn = (e) => {
    e?.preventDefault();
    if (!username) return;

    const event = recordInspection({
      targetApp: 'ApexPortal',
      targetHost: 'auth.apex-corp.internal',
      method: 'POST',
      endpoint: '/api/v1/auth/login',
      clientIp: '198.51.100.44',
      field: 'username',
      payload: username,
    });

    setInterceptEvent(event);
    if (event.verdict === 'BLOCKED') {
      setStatus('BLOCKED');
    } else {
      setStatus('ALLOWED');
    }
  };

  const loadPreset = (preset) => {
    setUsername(preset.user);
    setPassword(preset.pass || 'P@ssw0rd2026!');
    setStatus('IDLE');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-blue-600 selection:text-white">
      {/* Portal Top Bar */}
      <header className="flex items-center justify-between pb-6 border-b border-slate-800/80 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-600/20">
            ▲
          </div>
          <div>
            <h1 className="font-semibold text-slate-100 text-sm tracking-wide">Apex Technologies</h1>
            <span className="text-[11px] text-slate-400 font-mono">Global Identity &amp; Access Management (IAM)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs font-mono text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Apex SSO Gateway v4.8
          </span>
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 text-xs text-amber-400 font-medium transition-colors"
          >
            Open SQLGuard WAF <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md w-full mx-auto my-10 space-y-6">
        {status === 'BLOCKED' && interceptEvent ? (
          /* Realistic WAF 403 Forbidden Interstitial */
          <div className="rounded-xl border border-red-500/30 bg-slate-900/90 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
                <AlertOctagon className="h-5 w-5" />
              </div>
              <div>
                <span className="font-mono text-xs text-red-400 font-semibold uppercase">HTTP 403 Forbidden</span>
                <h2 className="text-base font-bold text-slate-100">Request Blocked by SQLGuard WAF</h2>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              A high-risk SQL injection vector was identified in the HTTP POST body. The connection was terminated at the edge before hitting the authentication database.
            </p>

            <div className="rounded-lg bg-slate-950 p-3 font-mono text-[11px] space-y-1.5 text-slate-400 border border-slate-800">
              <div className="flex justify-between">
                <span>Incident ID:</span>
                <span className="text-slate-200">{interceptEvent.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Rule Triggered:</span>
                <span className="text-red-400 font-semibold">{interceptEvent.mitigationRule}</span>
              </div>
              <div className="flex justify-between">
                <span>Risk Score:</span>
                <span className="text-red-400 font-semibold">{interceptEvent.riskScore} / 100</span>
              </div>
              <div className="flex justify-between">
                <span>Client IP:</span>
                <span className="text-slate-300">{interceptEvent.clientIp}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => setStatus('IDLE')}
                className="text-xs text-slate-400 hover:text-slate-200 underline font-medium"
              >
                ← Return to Login Form
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-1 rounded bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 text-xs font-semibold shadow-lg shadow-red-500/20 transition-colors"
              >
                Inspect in SQLGuard <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ) : status === 'ALLOWED' ? (
          /* Realistic Authenticated Session Screen */
          <div className="rounded-xl border border-emerald-500/30 bg-slate-900/90 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <span className="font-mono text-xs text-emerald-400 font-semibold uppercase">Authentication Verified</span>
                <h2 className="text-base font-bold text-slate-100">Welcome back, Sarah Jenkins</h2>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Session token issued. Identity verified through enterprise Active Directory. No malicious patterns detected in payload.
            </p>

            <div className="rounded-lg bg-slate-950 p-3 font-mono text-[11px] space-y-1.5 text-slate-400 border border-slate-800">
              <div className="flex justify-between">
                <span>User Principal:</span>
                <span className="text-slate-200 font-medium">s.jenkins@apexcorp.com</span>
              </div>
              <div className="flex justify-between">
                <span>WAF Status:</span>
                <span className="text-emerald-400 font-semibold">200 ALLOWED (VERIFIED)</span>
              </div>
              <div className="flex justify-between">
                <span>Security Level:</span>
                <span className="text-slate-300">Level 4 (Executive IAM)</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => setStatus('IDLE')}
                className="text-xs text-slate-400 hover:text-slate-200 underline font-medium"
              >
                Log Out
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 text-xs font-semibold transition-colors"
              >
                View Audit Log in SQLGuard <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ) : (
          /* Realistic Corporate Login Card */
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl backdrop-blur space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Single Sign-On (SSO)</h2>
              <p className="text-xs text-slate-400 mt-1">Authenticate with your corporate directory credentials.</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Corporate Identity / Username</label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="user@apexcorp.com"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  <span className="text-[11px] text-blue-400 hover:underline cursor-pointer">Forgot?</span>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-950 text-blue-600" />
                  <span>Trust this enterprise device</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 text-white py-2.5 text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
              >
                <KeyRound className="h-4 w-4" />
                Sign In to Corporate Network
              </button>
            </form>
          </div>
        )}

        {/* Security Test Bench Drawer */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-amber-400" />
              Security Injection Presets
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Quick test vectors</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {ATTACK_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => loadPreset(preset)}
                className={`text-left rounded-lg border p-2.5 transition-all text-xs ${
                  preset.isMalicious
                    ? 'border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-300'
                    : 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="font-mono font-semibold truncate text-[11px]">{preset.label}</div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{preset.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-500 font-mono border-t border-slate-900 pt-4">
        Apex Technologies IAM Service • Node ID: #APX-DC-01 • Monitored in real-time by SQLGuard WAF
      </footer>
    </div>
  );
}
