'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Globe,
  HelpCircle,
  Laptop,
  Fingerprint,
} from 'lucide-react';
import { recordInspection } from '../../../lib/store';
import FloatingAttackBench from '../../../components/FloatingAttackBench';
import StageshowWindow from '../../../components/StageshowWindow';

const ATTACK_PRESETS = [
  {
    label: 'Normal Employee Login',
    user: 'sarah.jenkins@apexcorp.internal',
    pass: 'K9#xL92@mPq',
    desc: 'Valid enterprise user credential lookup',
    isMalicious: false,
  },
  {
    label: "Tautology: admin' OR '1'='1' --",
    user: "admin' OR '1'='1' --",
    pass: 'anypass',
    desc: 'Forces query WHERE clause to evaluate to TRUE',
    isMalicious: true,
  },
  {
    label: "Comment Cutoff: admin'--",
    user: "admin'--",
    pass: '',
    desc: 'Truncates password verification using SQL comments',
    isMalicious: true,
  },
  {
    label: 'Char Function Obfuscation',
    user: "' OR CHAR(49)=CHAR(49) --",
    pass: 'x',
    desc: 'Bypasses quote filters via ASCII integer functions',
    isMalicious: true,
  },
];

export default function ApexPortalLogin() {
  const [username, setUsername] = useState('sarah.jenkins@apexcorp.internal');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [status, setStatus] = useState('IDLE'); // 'IDLE' | 'ALLOWED' | 'BLOCKED'
  const [interceptEvent, setInterceptEvent] = useState(null);

  const handleSignIn = (e) => {
    e?.preventDefault();
    if (!username.trim()) return;

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
    setPassword(preset.pass || 'CorpPass2026!');
    setStatus('IDLE');
  };

  return (
    <div className="min-h-screen bg-[#070709] text-slate-100 flex flex-col justify-between p-2 sm:p-6 font-sans selection:bg-blue-600 selection:text-white">
      <StageshowWindow
        url="auth.apex-corp.internal/v2/sso"
        title="Apex Technologies IAM"
        badge="ZERO TRUST ACTIVE"
        badgeTone="emerald"
        className="max-w-6xl w-full mx-auto my-auto min-h-[640px] flex flex-col"
      >
        {/* Top Enterprise Security Banner */}
        <div className="border-b border-slate-800 bg-slate-900/60 px-6 py-2.5 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-semibold">Apex Technologies IAM</span>
            <span className="text-slate-600">/</span>
            <span>Gateway Node: us-east-prod-04</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hidden sm:inline">Zero Trust Enforced</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Globe className="h-3 w-3 text-slate-400" /> auth.apex-corp.internal
            </span>
          </div>
        </div>

      {/* Main Split Layout */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-8 py-10 my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Authentic Enterprise Branding & Security Proofs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-xl shadow-lg shadow-blue-600/30">
              ▲
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Apex Technologies</h1>
              <p className="text-xs text-slate-400 font-mono">Enterprise Identity &amp; Access Management</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Single Sign-On for Authorized Personnel Only
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Authenticate using your verified corporate credentials or hardware security key to access internal production networks, code repositories, and cloud clusters.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3.5 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Zero Trust Compliant</span>
              </div>
              <p className="text-[11px] text-slate-500">Every packet inspected &amp; encrypted at edge.</p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3.5 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Fingerprint className="h-4 w-4 text-blue-400" />
                <span>MFA / FIDO2 Enforced</span>
              </div>
              <p className="text-[11px] text-slate-500">Hardware token or biometric verification.</p>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2 pt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Identity Cluster Status: All systems normal (99.998% uptime)</span>
          </div>
        </div>

        {/* Right Column: Interactive Login Container */}
        <div className="lg:col-span-6 max-w-md w-full mx-auto">
          {status === 'BLOCKED' && interceptEvent ? (
            /* Authentic Enterprise WAF 403 Security Interstitial */
            <div className="rounded-2xl border border-rose-500/30 bg-slate-900/95 p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3.5 pb-2 border-b border-slate-800">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <span className="font-mono text-[11px] text-rose-400 font-bold uppercase tracking-wide">
                    HTTP 403 Forbidden • Access Denied
                  </span>
                  <h3 className="text-base font-bold text-white">Security Violation Detected</h3>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Your request was blocked by the Web Application Firewall. An illegal SQL syntax sequence was detected in the username parameter before query evaluation.
              </p>

              <div className="rounded-lg bg-slate-950 p-4 font-mono text-xs space-y-2 text-slate-400 border border-slate-800">
                <div className="flex justify-between">
                  <span>Incident ID:</span>
                  <span className="text-slate-200 font-semibold">{interceptEvent.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Client IP:</span>
                  <span className="text-slate-300">{interceptEvent.clientIp}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Host:</span>
                  <span className="text-slate-300">auth.apex-corp.internal</span>
                </div>
                <div className="flex justify-between">
                  <span>Firewall Action:</span>
                  <span className="text-rose-400 font-bold">WAF_REJECT (TERMINATE)</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setStatus('IDLE')}
                  className="w-full rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 text-xs font-semibold transition-colors"
                >
                  ← Return to Corporate Sign In
                </button>
              </div>
            </div>
          ) : status === 'ALLOWED' ? (
            /* Authentic Authenticated User Session View */
            <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/95 p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3.5 pb-2 border-b border-slate-800">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <span className="font-mono text-[11px] text-emerald-400 font-bold uppercase tracking-wide">
                    Identity Verified • Session Active
                  </span>
                  <h3 className="text-base font-bold text-white">Welcome, Sarah Jenkins</h3>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Corporate credentials validated successfully. JWT authentication bearer token has been dispatched to your session manager.
              </p>

              <div className="rounded-lg bg-slate-950 p-4 font-mono text-xs space-y-2 text-slate-400 border border-slate-800">
                <div className="flex justify-between">
                  <span>User Principal:</span>
                  <span className="text-slate-200">sarah.jenkins@apexcorp.internal</span>
                </div>
                <div className="flex justify-between">
                  <span>Clearance Level:</span>
                  <span className="text-slate-200 font-semibold">Tier 3 (DevOps Cluster Admin)</span>
                </div>
                <div className="flex justify-between">
                  <span>Session Expiry:</span>
                  <span className="text-slate-300">8 hours</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setStatus('IDLE')}
                  className="w-full rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 text-xs font-semibold transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            /* Authentic Production Enterprise Login Card */
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-7 shadow-2xl backdrop-blur-xl space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white">Account Authentication</h3>
                <p className="text-xs text-slate-400 mt-1">Enter your assigned company identity to proceed.</p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Corporate Email or Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="user@apexcorp.internal"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-medium text-slate-300">Password</label>
                    <span className="text-[11px] text-blue-400 hover:underline cursor-pointer">
                      Forgot credentials?
                    </span>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
                    />
                    <span>Trust this verified device for 30 days</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 text-white py-2.5 text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <KeyRound className="h-4 w-4" />
                  Sign In to Apex Network
                </button>
              </form>

              <div className="pt-2 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
                <span>Need access? </span>
                <span className="text-slate-400 hover:underline cursor-pointer">Contact IT Helpdesk</span>
              </div>
            </div>
          )}
        </div>
      </main>

        {/* Authentic Enterprise Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 px-6 py-3 text-center text-[11px] font-mono text-slate-500">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>&copy; {new Date().getFullYear()} Apex Technologies Inc. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-400 cursor-pointer">Security Policy</span>
              <span className="hover:text-slate-400 cursor-pointer">Privacy Notice</span>
              <span className="hover:text-slate-400 cursor-pointer">Compliance Portal</span>
            </div>
          </div>
        </footer>
      </StageshowWindow>

      {/* Floating Discreet Attack Bench (No Backlinks) */}
      <FloatingAttackBench
        themeColor="blue"
        title="ApexPortal Payload Lab"
        presets={ATTACK_PRESETS}
        onSelect={(preset) => loadPreset(preset)}
      />
    </div>
  );
}
