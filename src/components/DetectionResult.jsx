'use client';

import RiskBadge from './RiskBadge';

export default function DetectionResult({ result }) {
  if (!result) return null;

  return (
    <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">Detection Result</h3>
        <RiskBadge level={result.level} score={result.riskScore} />
      </div>

      {/* Risk bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-zinc-500">
          <span>Risk Score</span>
          <span>{result.riskScore}/100</span>
        </div>
        <div className="h-2 w-full rounded-full bg-zinc-800">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              result.riskScore <= 15 ? 'bg-emerald-500' :
              result.riskScore <= 35 ? 'bg-yellow-500' :
              result.riskScore <= 60 ? 'bg-amber-500' :
              result.riskScore <= 80 ? 'bg-orange-500' :
              'bg-red-500'
            }`}
            style={{ width: `${result.riskScore}%` }}
          />
        </div>
      </div>

      {/* Status */}
      <div className={`rounded-md border px-3 py-2 text-sm ${
        result.isMalicious
          ? 'border-red-500/20 bg-red-500/5 text-red-400'
          : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
      }`}>
        {result.isMalicious ? '⛔ BLOCKED — Malicious input detected' : '✓ ALLOWED — Input appears safe'}
      </div>

      {/* Explanation */}
      <p className="text-sm text-zinc-400">{result.explanation}</p>

      {/* Matched patterns */}
      {result.matches.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Matched Patterns</h4>
          <div className="space-y-1.5">
            {result.matches.map((m, i) => (
              <div key={i} className="flex items-start justify-between rounded border border-zinc-800 bg-zinc-950 px-3 py-2">
                <div>
                  <span className="text-sm font-medium text-zinc-200">{m.name}</span>
                  <p className="text-xs text-zinc-500 mt-0.5">{m.description}</p>
                  <span className="text-xs code-font text-amber-400 mt-0.5 block">Matched: {m.matched}</span>
                </div>
                <span className={`text-xs font-medium ${
                  m.severity >= 8 ? 'text-red-400' : m.severity >= 5 ? 'text-amber-400' : 'text-yellow-400'
                }`}>
                  {m.severity}/10
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
