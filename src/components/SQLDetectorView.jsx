'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Trash2,
  Terminal,
  Activity,
  Layers,
  Binary,
  Check,
  Flame,
} from 'lucide-react';
import { detectSQLInjection } from '../lib/detector';
import { analyzeASTMutation } from '../lib/lexer';
import { recordInspection } from '../lib/store';

const PRESET_PAYLOADS = [
  {
    category: 'Common Attacks',
    items: [
      { label: "Tautology (' OR 1=1)", value: "' OR 1=1 --" },
      { label: "Auth Bypass (admin')", value: "admin' OR '1'='1' --" },
      { label: "UNION Exfil", value: "' UNION SELECT username, password FROM users --" },
      { label: "Stacked DROP", value: "'; DROP TABLE users; --" },
      { label: "Time-based Blind", value: "' OR SLEEP(5) --" },
    ],
  },
  {
    category: 'Evasion & Obfuscation',
    items: [
      { label: "Comment Fragmentation", value: "admin'/**/OR/**/1=1#" },
      { label: "Scientific Notation", value: "' OR 1e0=1e0 --" },
      { label: "Bitwise Logic", value: "' OR (1^0)=1 --" },
      { label: "CHAR Encoding", value: "' OR CHAR(49)=CHAR(49) --" },
      { label: "Newline Splitting", value: "admin'\nOR\n'1'='1" },
    ],
  },
  {
    category: 'Safe / Benign',
    items: [
      { label: "Standard Username", value: "sarah.jenkins@apexcorp.internal" },
      { label: "Search Query", value: "ergonomic mechanical keyboard" },
      { label: "Numeric ID", value: "48201" },
    ],
  },
];

export default function SQLDetectorView({ onLogRecorded }) {
  const [query, setQuery] = useState("admin' OR '1'='1' --");
  const [result, setResult] = useState(null);
  const [lexerData, setLexerData] = useState(null);
  const [recordedNotice, setRecordedNotice] = useState(false);

  const runDetection = useCallback((inputToTest) => {
    const text = inputToTest !== undefined ? inputToTest : query;
    if (!text || text.trim() === '') {
      setResult(null);
      setLexerData(null);
      return;
    }

    const det = detectSQLInjection(text);
    const lex = analyzeASTMutation(text);

    setResult(det);
    setLexerData(lex);

    // Record into WAF Telemetry Store
    recordInspection({
      targetApp: 'SQLDetector',
      targetHost: 'console.sqlguard.internal',
      method: 'POST',
      endpoint: '/api/v1/inspect/query',
      clientIp: '127.0.0.1',
      field: 'sql_query',
      payload: text,
    });

    onLogRecorded?.();

    setRecordedNotice(true);
    setTimeout(() => setRecordedNotice(false), 2000);
  }, [query, onLogRecorded]);

  // Run initial detection on mount
  useEffect(() => {
    runDetection("admin' OR '1'='1' --");
  }, []);

  const handlePresetClick = (val) => {
    setQuery(val);
    runDetection(val);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runDetection();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl font-sans animate-in fade-in duration-150">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <h2 className="text-base font-bold text-zinc-100 font-mono uppercase tracking-wide">
            SQL Injection Detection Engine
          </h2>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Enter any SQL query, HTTP parameter, or raw payload to test against the WAF detection rules and lexical analyzer.
          </p>
        </div>

        {recordedNotice && (
          <div className="flex items-center gap-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-mono text-emerald-400 animate-in fade-in duration-150">
            <Check className="h-3.5 w-3.5" />
            <span>Logged to WAF Stream</span>
          </div>
        )}
      </div>

      {/* Preset Payloads Bar */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
          Quick Test Payloads:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_PAYLOADS.map((group) =>
            group.items.map((item) => (
              <button
                key={item.label}
                onClick={() => handlePresetClick(item.value)}
                className={`rounded border px-2.5 py-1 text-xs font-mono transition-colors ${
                  query === item.value
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-300 font-semibold'
                    : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {item.label}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Query Input Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-400 font-semibold">SQL QUERY / INPUT PAYLOAD:</span>
          <span className="text-zinc-500 text-[11px]">[Ctrl + Enter to Run]</span>
        </div>

        <div className="relative rounded-xl border border-zinc-800 bg-zinc-950 p-2 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/20">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder="Enter SQL expression, e.g. ' OR 1=1 -- or SELECT * FROM users..."
            className="w-full bg-transparent p-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none resize-none"
          />

          <div className="flex items-center justify-between pt-2 border-t border-zinc-900 px-2">
            <span className="font-mono text-[10px] text-zinc-500">
              Length: {query.length} chars
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setQuery('');
                  setResult(null);
                  setLexerData(null);
                }}
                className="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear</span>
              </button>
              <button
                onClick={() => runDetection()}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-4 py-1.5 text-xs font-mono transition-colors shadow-sm"
              >
                <Zap className="h-3.5 w-3.5 fill-current" />
                <span>Analyze Query</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detection Results */}
      {result && (
        <div className="space-y-4">
          {/* Main Verdict Banner */}
          <div
            className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono ${
              result.isMalicious
                ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg mt-0.5 ${
                  result.isMalicious ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {result.isMalicious ? (
                  <ShieldAlert className="h-5 w-5" />
                ) : (
                  <ShieldCheck className="h-5 w-5" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tracking-tight">
                    {result.isMalicious ? 'HTTP 403 FORBIDDEN — SQL INJECTION BLOCKED' : 'HTTP 200 OK — SAFE INPUT ALLOWED'}
                  </span>
                </div>
                <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                  {result.explanation}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-zinc-800 pt-2 sm:pt-0 sm:pl-4">
              <span className="text-[10px] text-zinc-500 uppercase">WAF Verdict</span>
              <span
                className={`text-sm font-bold ${
                  result.isMalicious ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {result.isMalicious ? 'BLOCKED' : 'ALLOWED'}
              </span>
            </div>
          </div>

          {/* Telemetry Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            {/* Risk Score */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase">
                <span>Risk Score</span>
                <Flame className={`h-3 w-3 ${result.riskScore > 50 ? 'text-rose-400' : 'text-emerald-400'}`} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-xl font-bold ${result.riskScore > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {result.riskScore}
                </span>
                <span className="text-zinc-500 text-[10px]">/ 100</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    result.riskScore >= 75 ? 'bg-rose-500' : result.riskScore >= 35 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${result.riskScore}%` }}
                />
              </div>
            </div>

            {/* Severity Level */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3.5 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase block">Severity Tier</span>
              <div className="text-lg font-bold text-zinc-100 uppercase">
                {result.level?.label || 'SAFE'}
              </div>
              <span className="text-[10px] text-zinc-500 block">
                {result.matches.length} Rule Trigger(s)
              </span>
            </div>

            {/* Shannon Entropy */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3.5 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase block">Shannon Entropy</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-zinc-100">
                  {lexerData?.entropy ?? 0}
                </span>
                <span className="text-[10px] text-zinc-500">bits/char</span>
              </div>
              <span className="text-[10px] text-zinc-400 block truncate">
                {lexerData?.entropyVerdict || 'Normal distribution'}
              </span>
            </div>

            {/* Token Stream Count */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3.5 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase block">Tokens Decomposed</span>
              <div className="text-lg font-bold text-zinc-100">
                {lexerData?.tokenCount ?? 0}
              </div>
              <span className="text-[10px] text-zinc-400 block truncate">
                {lexerData?.grammarVerdict || 'Clean'}
              </span>
            </div>
          </div>

          {/* Matched Signatures Details */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs uppercase font-semibold text-zinc-200">
                Matched Detection Rules ({result.matches.length})
              </span>
              <span className="text-[10px] text-zinc-500">WAF SIGNATURE SET</span>
            </div>

            {result.matches.length === 0 ? (
              <p className="text-xs text-zinc-500 py-2 font-sans">
                No known attack signatures triggered. Input evaluated as clean benign query.
              </p>
            ) : (
              <div className="space-y-2">
                {result.matches.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-zinc-800/80 bg-zinc-950 p-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-200">{m.name}</span>
                        <span className="rounded bg-zinc-800 border border-zinc-700 px-1.5 py-0.2 text-[9px] text-zinc-400">
                          {m.patternId}
                        </span>
                      </div>
                      <p className="text-xs font-sans text-zinc-400">{m.description}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-1 text-xs text-amber-300 font-mono">
                        Matched: <span className="font-bold underline">{m.matched}</span>
                      </div>
                      <span className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded px-2 py-0.5">
                        Sev {m.severity}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Parsed SQL Tokens (Chips) */}
          {lexerData?.tokens && lexerData.tokens.length > 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2.5 font-mono">
              <span className="text-xs uppercase font-semibold text-zinc-400 block">
                Parsed SQL Token Decomposition:
              </span>
              <div className="flex flex-wrap gap-2">
                {lexerData.tokens.map((tok, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs ${
                      tok.risk === 'CRITICAL' || tok.risk === 'HIGH'
                        ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-300'
                    }`}
                  >
                    <span className="text-[9px] text-zinc-500 uppercase">{tok.type}:</span>
                    <span className="font-bold">{tok.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
