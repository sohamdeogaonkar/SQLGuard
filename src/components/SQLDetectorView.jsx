'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Trash2,
  Terminal,
  Check,
  Flame,
  SlidersHorizontal,
  Play,
  RotateCcw,
  Search,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  detectSQLInjection,
  getDisabledRuleIds,
  setRuleEnabled,
  toggleAllRules,
} from '../lib/detector';
import { analyzeASTMutation } from '../lib/lexer';
import { recordInspection } from '../lib/store';
import { SQL_PATTERNS } from '../lib/patterns';
import { predictSQLiML } from '../lib/mlModel';

const QUICK_PAYLOADS = [
  { label: "' OR 1=1 --", value: "' OR 1=1 --" },
  { label: "admin' OR '1'='1' --", value: "admin' OR '1'='1' --" },
  { label: "UNION SELECT", value: "' UNION SELECT username, password FROM users --" },
  { label: "'; DROP TABLE", value: "'; DROP TABLE users; --" },
  { label: "SLEEP(5)", value: "' OR SLEEP(5) --" },
  { label: "admin'/**/OR/**/1=1#", value: "admin'/**/OR/**/1=1#" },
  { label: "1e0=1e0", value: "' OR 1e0=1e0 --" },
  { label: "(1^0)=1", value: "' OR (1^0)=1 --" },
  { label: "CHAR(49)", value: "' OR CHAR(49)=CHAR(49) --" },
  { label: "admin (Safe)", value: "admin" },
  { label: "sarah@apex.com (Safe)", value: "sarah.jenkins@apexcorp.internal" },
];

export default function SQLDetectorView({ onLogRecorded, initialQuery }) {
  // 2-tab layout: 'test' | 'rules'
  const [activeTab, setActiveTab] = useState('test');
  const [query, setQuery] = useState(initialQuery || "admin' OR '1'='1' --");
  const [result, setResult] = useState(null);
  const [mlResult, setMlResult] = useState(null);
  const [lexerData, setLexerData] = useState(null);
  const [recordedNotice, setRecordedNotice] = useState(false);
  const [disabledIds, setDisabledIds] = useState([]);
  const [search, setSearch] = useState('');

  const refreshRules = () => {
    setDisabledIds(getDisabledRuleIds());
  };

  const runDetection = useCallback((inputToTest) => {
    const text = inputToTest !== undefined ? inputToTest : query;
    if (!text || text.trim() === '') {
      setResult(null);
      setMlResult(null);
      setLexerData(null);
      return;
    }

    const det = detectSQLInjection(text);
    const ml = predictSQLiML(text);
    const lex = analyzeASTMutation(text);

    setResult(det);
    setMlResult(ml);
    setLexerData(lex);

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
    setTimeout(() => setRecordedNotice(false), 1500);
  }, [query, onLogRecorded]);

  // Sync initial query
  useEffect(() => {
    if (initialQuery !== undefined && initialQuery !== query) {
      setQuery(initialQuery);
      runDetection(initialQuery);
    }
  }, [initialQuery]);

  // Initial detection and rule listener
  useEffect(() => {
    refreshRules();
    runDetection(query);

    const handleRulesChanged = () => {
      refreshRules();
      runDetection(query);
    };

    window.addEventListener('sqlguard-rules-changed', handleRulesChanged);
    return () => window.removeEventListener('sqlguard-rules-changed', handleRulesChanged);
  }, []);

  const handlePresetClick = (val) => {
    setQuery(val);
    runDetection(val);
  };

  const handleToggleRule = (ruleId) => {
    const isCurrentlyDisabled = disabledIds.includes(ruleId);
    setRuleEnabled(ruleId, isCurrentlyDisabled);
    refreshRules();
    runDetection(query);
  };

  const handleTestInTab = (examplePayload) => {
    setQuery(examplePayload);
    setActiveTab('test');
    runDetection(examplePayload);
  };

  const activeCount = SQL_PATTERNS.length - disabledIds.length;

  const filteredPatterns = SQL_PATTERNS.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.example.toLowerCase().includes(q) ||
      p.regex.toString().toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 max-w-5xl font-sans animate-in fade-in duration-150">
      {/* 2-Tab Switcher */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setActiveTab('test')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
              activeTab === 'test'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>Query Test</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
              activeTab === 'rules'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-400" />
            <span>Detectors List ({activeCount}/{SQL_PATTERNS.length})</span>
          </button>
        </div>

        {recordedNotice && (
          <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            <Check className="h-3 w-3" />
            <span>Logged</span>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: QUERY TEST */}
      {/* ========================================================= */}
      {activeTab === 'test' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Quick Payloads Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold mr-1">
              Presets:
            </span>
            {QUICK_PAYLOADS.map((item) => (
              <button
                key={item.label}
                onClick={() => handlePresetClick(item.value)}
                className={`rounded border px-2 py-0.5 text-[11px] font-mono transition-colors ${
                  query === item.value
                    ? 'border-amber-500/60 bg-amber-500/10 text-amber-300 font-bold'
                    : 'border-zinc-800 bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Query Input */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 focus-within:border-amber-500/50">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  runDetection();
                }
              }}
              rows={2}
              placeholder="Enter SQL expression..."
              className="w-full bg-transparent p-1.5 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none resize-none"
            />

            <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
              <span className="text-[10px] font-mono text-zinc-500">
                {query.length} chars
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setQuery('');
                    setResult(null);
                    setMlResult(null);
                    setLexerData(null);
                  }}
                  className="flex items-center gap-1 rounded px-2 py-1 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear</span>
                </button>
                <button
                  onClick={() => runDetection()}
                  className="flex items-center gap-1.5 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-3 py-1 text-xs font-mono transition-colors shadow-sm"
                >
                  <Zap className="h-3 w-3 fill-current" />
                  <span>Analyze</span>
                </button>
              </div>
            </div>
          </div>

          {/* Results Block */}
          {result && (
            <div className="space-y-3 font-mono">
              {/* Dual-Engine Verdict Banner */}
              <div
                className={`rounded-lg border px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono ${
                  result.isMalicious || mlResult?.isMalicious
                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                }`}
              >
                {/* WAF Rule Verdict */}
                <div className="flex items-center gap-2 min-w-0">
                  {result.isMalicious ? (
                    <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  )}
                  <span className="font-bold text-xs shrink-0">
                    {result.isMalicious ? 'WAF BLOCKED (403)' : 'WAF ALLOWED (200)'}
                  </span>
                  <span className="text-zinc-500 text-[11px]">—</span>
                  <span className="text-zinc-300 text-[11px] truncate">
                    {result.matches.length > 0
                      ? `${result.matches[0].name}`
                      : 'No rule match'}
                  </span>
                </div>

                {/* ML Model Prediction Badge */}
                {mlResult && (
                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-zinc-800 pt-1.5 sm:pt-0 sm:pl-3">
                    <span className="text-zinc-400 text-[11px]">ML Model:</span>
                    <span
                      className={`font-bold px-1.5 py-0.2 rounded text-[11px] ${
                        mlResult.isMalicious
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {mlResult.isMalicious ? `SQLi ${mlResult.probability}%` : `Benign ${mlResult.probability}%`}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      ({mlResult.inferenceTimeMs}ms)
                    </span>
                  </div>
                )}
              </div>

              {/* Compact Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 flex items-center justify-between">
                  <span className="text-zinc-500 text-[10px] uppercase">WAF Score</span>
                  <span className={`font-bold ${result.riskScore > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {result.riskScore}/100
                  </span>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 flex items-center justify-between">
                  <span className="text-zinc-500 text-[10px] uppercase">ML Prob</span>
                  <span className={`font-bold ${mlResult?.isMalicious ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {mlResult ? `${mlResult.probability}%` : 'N/A'}
                  </span>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 flex items-center justify-between">
                  <span className="text-zinc-500 text-[10px] uppercase">Entropy</span>
                  <span className="font-bold text-zinc-200">
                    {lexerData?.entropy ?? 0} <span className="text-[9px] text-zinc-500 font-normal">bits</span>
                  </span>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 flex items-center justify-between">
                  <span className="text-zinc-500 text-[10px] uppercase">Tokens</span>
                  <span className="font-bold text-zinc-200">{lexerData?.tokenCount ?? 0}</span>
                </div>
              </div>

              {/* ML Feature Attribution (Top Predictive Features) */}
              {mlResult?.topContributors && mlResult.topContributors.length > 0 && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold text-zinc-400">
                      ML Predictive Feature Attribution:
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {mlResult.modelName}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {mlResult.topContributors.map((c, i) => (
                      <span
                        key={i}
                        className={`rounded border px-2 py-0.5 text-[10px] ${
                          c.direction === 'MALICIOUS'
                            ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                            : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                        }`}
                      >
                        {c.feature}: <strong className="font-mono">{c.contribution > 0 ? `+${c.contribution}` : c.contribution}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Rules List */}
              {result.matches.length > 0 && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 space-y-1.5">
                  <span className="text-[10px] uppercase font-semibold text-zinc-400 block">
                    Matched Rules:
                  </span>
                  <div className="space-y-1.5">
                    {result.matches.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-200">{m.name}</span>
                          <span className="text-[10px] text-zinc-500">({m.patternId})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-300 text-[11px]">
                            Matched: <code className="font-bold">{m.matched}</code>
                          </span>
                          <span className="rounded bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.2 text-[10px] text-rose-400 font-bold">
                            Sev {m.severity}/10
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Parsed SQL Tokens */}
              {lexerData?.tokens && lexerData.tokens.length > 0 && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 space-y-1.5">
                  <span className="text-[10px] uppercase font-semibold text-zinc-400 block">
                    Tokens:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {lexerData.tokens.map((tok, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] ${
                          tok.risk === 'CRITICAL' || tok.risk === 'HIGH'
                            ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
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
      )}

      {/* ========================================================= */}
      {/* TAB 2: DETECTORS LIST (ALL 12 PATTERNS & CONTROLS) */}
      {/* ========================================================= */}
      {activeTab === 'rules' && (
        <div className="space-y-3 font-mono animate-in fade-in duration-150">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-300 font-bold">
                {activeCount}/{SQL_PATTERNS.length} Active
              </span>
              <button
                onClick={() => {
                  toggleAllRules(true);
                  refreshRules();
                }}
                className="text-[11px] rounded bg-zinc-800 px-2 py-0.5 text-zinc-300 hover:text-white"
              >
                Enable All
              </button>
              <button
                onClick={() => {
                  toggleAllRules(false);
                  refreshRules();
                }}
                className="text-[11px] rounded bg-zinc-800 px-2 py-0.5 text-zinc-400 hover:text-white"
              >
                Disable All
              </button>
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search detectors..."
                className="w-full rounded border border-zinc-800 bg-zinc-900/90 pl-8 pr-2.5 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          {/* ML Classifier Model Specifications */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
              <span className="font-bold text-zinc-200">ML Classifier Engine</span>
              <span className="text-[10px] text-zinc-500">— Logistic Regression (L2 + Char TF-IDF)</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-zinc-400">
              <span>Accuracy: <strong className="text-emerald-400">99.31%</strong></span>
              <span>Recall: <strong className="text-emerald-400">100%</strong></span>
              <span>F1: <strong className="text-emerald-400">0.9945</strong></span>
              <span>ROC-AUC: <strong className="text-emerald-400">1.0</strong></span>
            </div>
          </div>

          {/* Compact Pattern Rows */}
          <div className="space-y-1.5">
            {filteredPatterns.map((pattern) => {
              const isDisabled = disabledIds.includes(pattern.id);
              return (
                <div
                  key={pattern.id}
                  className={`rounded-lg border px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
                    isDisabled
                      ? 'border-zinc-800/50 bg-zinc-950/40 opacity-60'
                      : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Toggle */}
                    <button
                      onClick={() => handleToggleRule(pattern.id)}
                      className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        !isDisabled ? 'bg-emerald-500' : 'bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          !isDisabled ? 'translate-x-3' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    <span className="font-bold text-xs text-zinc-200 truncate">
                      {pattern.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 hidden md:inline">
                      ({pattern.id})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <code className="text-[10px] text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 max-w-[200px] truncate">
                      {pattern.regex.toString()}
                    </code>

                    <span
                      className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                        pattern.severity >= 10
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      Sev {pattern.severity}
                    </span>

                    <button
                      onClick={() => handleTestInTab(pattern.example)}
                      className="flex items-center gap-1 rounded bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 text-[11px] text-zinc-200"
                    >
                      <Play className="h-2.5 w-2.5 fill-current text-amber-400" />
                      <span>Test</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
