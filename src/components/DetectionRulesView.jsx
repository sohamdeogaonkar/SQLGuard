'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  Check,
  X,
  Play,
  RotateCcw,
  Sliders,
  Filter,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { SQL_PATTERNS } from '../lib/patterns';
import { getDisabledRuleIds, setRuleEnabled, toggleAllRules } from '../lib/detector';

export default function DetectionRulesView({ onTestInDetector }) {
  const [disabledIds, setDisabledIds] = useState([]);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'

  const refreshRules = () => {
    setDisabledIds(getDisabledRuleIds());
  };

  useEffect(() => {
    refreshRules();
    const handleRulesChanged = (e) => {
      if (e.detail?.disabled) {
        setDisabledIds(e.detail.disabled);
      } else {
        refreshRules();
      }
    };
    window.addEventListener('sqlguard-rules-changed', handleRulesChanged);
    return () => window.removeEventListener('sqlguard-rules-changed', handleRulesChanged);
  }, []);

  const handleToggle = (ruleId) => {
    const isCurrentlyDisabled = disabledIds.includes(ruleId);
    setRuleEnabled(ruleId, isCurrentlyDisabled);
    refreshRules();
  };

  const handleEnableAll = () => {
    toggleAllRules(true);
    refreshRules();
  };

  const handleDisableAll = () => {
    toggleAllRules(false);
    refreshRules();
  };

  const handleResetDefaults = () => {
    toggleAllRules(true);
    refreshRules();
  };

  const filteredPatterns = SQL_PATTERNS.filter((pattern) => {
    // Severity filter
    if (severityFilter === 'CRITICAL' && pattern.severity < 10) return false;
    if (severityFilter === 'HIGH' && (pattern.severity < 8 || pattern.severity >= 10)) return false;
    if (severityFilter === 'MEDIUM' && pattern.severity >= 8) return false;

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        pattern.name.toLowerCase().includes(q) ||
        pattern.id.toLowerCase().includes(q) ||
        pattern.description.toLowerCase().includes(q) ||
        pattern.example.toLowerCase().includes(q) ||
        pattern.regex.toString().toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeCount = SQL_PATTERNS.length - disabledIds.length;
  const criticalCount = SQL_PATTERNS.filter((p) => p.severity >= 10).length;

  return (
    <div className="space-y-6 max-w-5xl font-sans animate-in fade-in duration-150">
      {/* Header & Status Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-400" />
            <h2 className="text-base font-bold text-zinc-100 font-mono uppercase tracking-wide">
              WAF Detection Rules & Signatures
            </h2>
          </div>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Active inspection engine signature set. Toggle rules on or off to control how incoming SQL queries are evaluated.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleEnableAll}
            className="flex items-center gap-1.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-2.5 py-1 text-xs font-mono text-zinc-200 transition-colors"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Enable All</span>
          </button>
          <button
            onClick={handleDisableAll}
            className="flex items-center gap-1.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-2.5 py-1 text-xs font-mono text-zinc-200 transition-colors"
          >
            <XCircle className="h-3.5 w-3.5 text-rose-400" />
            <span>Disable All</span>
          </button>
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-2.5 py-1 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3.5 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase block">Total Signatures</span>
          <div className="text-xl font-bold text-zinc-100">{SQL_PATTERNS.length}</div>
          <span className="text-[10px] text-zinc-500 block">Inspection Models</span>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3.5 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase block">Active Detectors</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-emerald-400">{activeCount}</span>
            <span className="text-zinc-500 text-[10px]">/ {SQL_PATTERNS.length}</span>
          </div>
          <span className="text-[10px] text-emerald-400/80 block">Enforcing at Edge</span>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3.5 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase block">Disabled Detectors</span>
          <div className="text-xl font-bold text-amber-400">{disabledIds.length}</div>
          <span className="text-[10px] text-zinc-500 block">Bypassed from eval</span>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3.5 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase block">Critical Severity (10/10)</span>
          <div className="text-xl font-bold text-rose-400">{criticalCount}</div>
          <span className="text-[10px] text-zinc-500 block">Instant Drop (403)</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`rounded-md px-2.5 py-1 font-mono text-xs transition-colors ${
                severityFilter === sev
                  ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              {sev === 'ALL' ? 'All Severities' : sev}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rules, regex, descriptions..."
            className="w-full rounded-md border border-zinc-800 bg-zinc-900/90 pl-9 pr-3 py-1.5 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none"
          />
        </div>
      </div>

      {/* List of Detectors */}
      <div className="space-y-3">
        {filteredPatterns.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-xs font-mono text-zinc-500">
            No detection rules match your search filter.
          </div>
        ) : (
          filteredPatterns.map((pattern) => {
            const isDisabled = disabledIds.includes(pattern.id);
            const isCritical = pattern.severity >= 10;
            const isHigh = pattern.severity >= 8 && pattern.severity < 10;

            return (
              <div
                key={pattern.id}
                className={`rounded-xl border transition-all p-4 ${
                  isDisabled
                    ? 'border-zinc-800/60 bg-zinc-950/40 opacity-70'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                }`}
              >
                {/* Rule Title Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    {/* Toggle Button */}
                    <button
                      onClick={() => handleToggle(pattern.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        !isDisabled ? 'bg-emerald-500' : 'bg-zinc-700'
                      }`}
                      title={!isDisabled ? 'Rule Active — Click to Disable' : 'Rule Disabled — Click to Enable'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          !isDisabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-100">{pattern.name}</span>
                        <span className="rounded bg-zinc-800 border border-zinc-700 px-1.5 py-0.2 font-mono text-[9px] text-zinc-400">
                          {pattern.id}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[9px] font-mono font-bold ${
                            !isDisabled
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                              : 'bg-zinc-800 border border-zinc-700 text-zinc-500'
                          }`}
                        >
                          {!isDisabled ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-sans mt-0.5">{pattern.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`rounded px-2 py-0.5 font-mono text-xs font-bold ${
                        isCritical
                          ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                          : isHigh
                          ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                          : 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
                      }`}
                    >
                      Sev {pattern.severity}/10
                    </span>

                    {onTestInDetector && (
                      <button
                        onClick={() => onTestInDetector(pattern.example)}
                        className="flex items-center gap-1 rounded bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 px-2.5 py-1 text-xs font-mono text-zinc-200 transition-colors"
                      >
                        <Play className="h-3 w-3 fill-current text-amber-400" />
                        <span>Test</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Pattern Anatomy & Example */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 font-mono text-xs">
                  {/* Regex Signature */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold block">
                      Detection Signature (Regex):
                    </span>
                    <div className="rounded-lg border border-zinc-800/80 bg-zinc-950 p-2 text-zinc-300 text-[11px] overflow-x-auto truncate">
                      <code>{pattern.regex.toString()}</code>
                    </div>
                  </div>

                  {/* Sample Payload */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold block">
                      Test Attack Payload:
                    </span>
                    <div className="flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-950 p-2 text-[11px] text-amber-300 overflow-x-auto">
                      <code className="truncate">{pattern.example}</code>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
